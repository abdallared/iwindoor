import test from 'node:test';
import assert from 'node:assert/strict';
import {createItem,validateItem,calculateItem} from '../src/core.js';
import {createDesignTemplate,getDesignGeometry,splitPanelCount,setSlidingGroup,updatePanel,mirrorDesign} from '../src/design.js';
import {glassBounds} from '../src/vent.js';
import {drawing} from '../src/drawing.js';
test('free design recursively splits equal sections and hosts independent sliding units',()=>{
 const i={...createItem(),...createDesignTemplate('custom')};
 i.design=splitPanelCount(i,getDesignGeometry(i).panels[0].id,'horizontal',3);
 let g=getDesignGeometry(i);assert(g.panels.every(p=>Math.abs(p.height-g.panels[0].height)<1e-8));
 i.design=splitPanelCount(i,g.panels[1].id,'vertical',2);
 g=getDesignGeometry(i);const ids=[g.panels[1].id,g.panels[2].id];
 for(const id of ids)i.design=setSlidingGroup(i,id,2);
 assert.equal(getDesignGeometry(i).groups.length,2);assert.deepEqual(validateItem(i),[]);
});
test('fan hole persists in geometry/report, respects glass bounds, mirrors and does not reduce blank price',()=>{
 const i={...createItem(),...createDesignTemplate('custom')};
 const p=getDesignGeometry(i).panels[0],box=glassBounds(i,p,i.design),before=calculateItem(i);
 i.design=updatePanel(i,p.id,{vent:{diameter:150,x:200,y:250}});
 assert(drawing(i).includes('class="fan-opening"'));
 const r=calculateItem(i);assert.deepEqual(r.glassPieces[0].vent,{diameter:150,x:200,y:250});assert.equal(r.totalPrice,before.totalPrice);
 assert.deepEqual(validateItem(JSON.parse(JSON.stringify(i))),[]);
 assert.throws(()=>updatePanel(i,p.id,{vent:{diameter:150,x:20,y:20}}));
 assert.throws(()=>updatePanel(i,p.id,{mode:'solid'}));
 assert.throws(()=>splitPanelCount(i,p.id,'vertical',2));
 i.design=mirrorDesign(i);assert.equal(getDesignGeometry(i).panels[0].vent.x,box.width-200);
 i.design=updatePanel(i,p.id,{vent:null});assert(!drawing(i).includes('class="fan-opening"'));
});
