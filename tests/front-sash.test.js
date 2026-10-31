import test from 'node:test';
import assert from 'node:assert/strict';
import {createItem,calculateItem,defaultSettings} from '../src/core.js';
import {createDesignTemplate,getDesignGeometry,setMeetingPreset,setSashJoint} from '../src/design.js';
import {slidingProjection} from '../src/sliding.js';
test('fabrication sash joint changes external corners while retaining meeting cuts',()=>{
 const i={...createItem(),...createDesignTemplate('sliding')};
 i.design=setMeetingPreset(i,i.design.layouts[0].id,'thick');
 for(const joint of ['butt','mitre']){
  i.design=setSashJoint(i,joint);const cuts=calculateItem(i,defaultSettings()).cuts;
  assert(cuts.filter(c=>c.type==='meeting').every(c=>c.angleStart===45));
  assert.equal(cuts.find(c=>c.part==='panel 1 left').angleStart,joint==='butt'?90:45);
 }
});
test('projection hides each rear meeting stile and keeps physical quantities unchanged',()=>{
 const i={...createItem(),...createDesignTemplate('sliding-4')};
 i.design=setMeetingPreset(i,i.design.layouts[0].id,'thick');
 const panels=getDesignGeometry(i).panels, original=structuredClone(panels);
 for(const side of ['left','right']){
  const display=slidingProjection(panels,side);
  const sorted=[...display].sort((a,b)=>a.x-b.x);
  for(let j=0;j<sorted.length-1;j++){
   const a=sorted[j],b=sorted[j+1];
   assert.equal(a.x+a.width-b.x,side==='right'?a.edges.right.width:b.edges.left.width);
  }
  assert.equal(display.at(-1).sashIndex,side==='right'?3:0);
 }
 assert.deepEqual(panels,original);
});
