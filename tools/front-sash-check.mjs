import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1100}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
const click=a=>p.locator(`[data-action="${a}"]`).first().click();
try{
 await p.goto('http://127.0.0.1:5173');await click('add-item');await p.locator('[data-template="sliding"]').click();
 await click('meeting-thick');await click('inspector-fabrication');
 const joints=()=>p.locator('.drawing-stage .sliding-joints').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join('|'));
 const before=await joints();
 await p.locator('[data-scope="design"][data-key="sashJoint"]').selectOption('butt');assert.notEqual(await joints(),before);
 await p.locator('[data-scope="design"][data-key="sashJoint"]').selectOption('mitre');assert.equal(await joints(),before);
 await click('front-left');assert.equal(await p.locator('.drawing-stage [data-panel]').last().getAttribute('data-panel'),'0');
 await p.screenshot({path:'screenshots/front-left.png',fullPage:true});
 await click('front-right');assert.equal(await p.locator('.drawing-stage [data-panel]').last().getAttribute('data-panel'),'1');
 await p.screenshot({path:'screenshots/front-right.png',fullPage:true});
 await p.reload();assert.equal(await p.locator('[data-action="front-right"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);console.log('PASS: fabrication cuts visibly switch, left/right front layering and persistence.');
}finally{await b.close();}
