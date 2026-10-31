import test from 'node:test';
import assert from 'node:assert/strict';
import {createItem,calculateItem,defaultSettings} from '../src/core.js';
import {createDesignTemplate,getDesignGeometry,setMeetingPreset,mirrorDesign} from '../src/design.js';
test('meeting presets replace overrides and change real meeting cut angles',()=>{
 const i={...createItem(),...createDesignTemplate('sliding')};
 const n=i.design.layouts[0];n.children[0].edgeOverrides={right:{width:12,joint:'butt'},top:{width:45,joint:'butt'}};
 i.design=setMeetingPreset(i,n.id,'thick');
 let cuts=calculateItem(i,defaultSettings()).cuts.filter(c=>c.type==='meeting');
 assert(cuts.every(c=>c.profileFace===50&&c.angleStart===45&&c.angleEnd===45));
 i.design=setMeetingPreset(i,n.id,'thin');
 cuts=calculateItem(i,defaultSettings()).cuts.filter(c=>c.type==='meeting');
 assert(cuts.every(c=>c.profileFace===20&&c.angleStart===90&&c.angleEnd===90));
});
test('mirroring twice restores unequal divisions, modes, handles and edge overrides',()=>{
 for(const key of ['mixed','sliding','corner-mixed']) {
  const i={...createItem(),...createDesignTemplate(key)};
  if(key==='corner-mixed')i.design.cornerSide='left';
  const initial=structuredClone(i.design), before=getDesignGeometry(i);
  i.design=mirrorDesign(i);
  const after=getDesignGeometry(i);
  for(const p of before.panels){const q=after.panels.find(q=>q.id===p.id);assert(Math.abs(q.x-(before.faces[p.face].width-p.x-p.width))<1e-6);}
  i.design=mirrorDesign(i);assert.deepEqual(i.design,initial);
 }
});
