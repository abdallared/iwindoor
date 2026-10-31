import test from 'node:test';
import assert from 'node:assert/strict';
import {createItem,validateItem,calculateItem} from '../src/core.js';
import {createDesignTemplate,getDesignGeometry,removeSlidingGroup,splitPanelCount,updatePanel,listSplits,mirrorDesign} from '../src/design.js';
test('fixed sides extend into arch and centre retains independent customization',()=>{
 const i={...createItem(),...createDesignTemplate('arched-sides')};
 assert.deepEqual(validateItem(i),[]);
 let g=getDesignGeometry(i);assert.equal(g.panels.length,4);
 assert(g.panels.slice(0,2).every(p=>p.curvedTop&&p.mode==='fixed'&&p.y<i.design.archRise));
 assert.equal(g.groups[0].x,330);assert.equal(g.groups[0].width,1140);
 const sides=g.panels.slice(0,2).map(p=>({x:p.x,width:p.width,area:p.curvedGlass.area}));
 i.design=removeSlidingGroup(i,g.groups[0].id);
 i.design=splitPanelCount(i,getDesignGeometry(i).panels[2].id,'horizontal',2);
 i.design=updatePanel(i,getDesignGeometry(i).panels[3].id,{mode:'right'});
 assert.deepEqual(getDesignGeometry(i).panels.slice(0,2).map(p=>({x:p.x,width:p.width,area:p.curvedGlass.area})),sides);
 const r=calculateItem(i);assert(r.cuts.every(c=>c.length>0));
 assert(r.cuts.find(c=>c.part==='arch transom').length< i.width-2*i.profile);
 i.design.archSideLeft=350;i.design.archSideRight=250;i.design=mirrorDesign(i);
 assert.equal(i.design.archSideLeft,250);assert.equal(i.design.archSideRight,350);
 assert.deepEqual(validateItem(JSON.parse(JSON.stringify(i))),[]);
 i.design=splitPanelCount(i,getDesignGeometry(i).panels[0].id,'horizontal',2);
 assert.equal(listSplits(i).length,2);
});
test('invalid side widths and layouts are rejected',()=>{
 const i={...createItem(),...createDesignTemplate('arched-sides')};
 for(const v of [-1,50,1700,NaN]){i.design.archSideLeft=v;assert(validateItem(i).length>0);}
 i.design.archSideLeft=300;i.design.archLeftLayout={kind:'panel'};assert(validateItem(i).length>0);
});
