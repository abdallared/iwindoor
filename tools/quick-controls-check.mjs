import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
const click=a=>p.locator(`[data-action="${a}"]`).first().click();
try{
 await p.goto('http://127.0.0.1:5173');await click('add-item');
 assert.equal(await p.locator('[data-template^="sliding"]').count(),1);
 await p.locator('[data-template="sliding"]').click();
 assert(await p.locator('[data-action="sash-remove"]').isDisabled());
 await click('sash-add');await click('sash-add');
 assert.equal(await p.locator('.drawing-stage [data-panel]').count(),4);
 await click('sash-remove');assert.equal(await p.locator('.drawing-stage [data-panel]').count(),3);
 await click('meeting-thick');assert.equal(await p.locator('[data-key="meetingWidth"]').inputValue(),'50');
 assert.equal(await p.locator('[data-key="meetingJoint"]').inputValue(),'mitre');
 await click('meeting-thin');assert.equal(await p.locator('[data-key="meetingWidth"]').inputValue(),'20');
 const old=await p.locator('.drawing-stage [data-panel="0"]').getAttribute('data-panel-id');
 await click('mirror-design');assert.equal(await p.locator('.drawing-stage [data-panel="2"]').getAttribute('data-panel-id'),old);
 await p.reload();assert.equal(await p.locator('.drawing-stage [data-panel]').count(),3);
 assert.deepEqual(errors,[]);console.log('PASS: single sliding template, +/- buttons, profile presets, whole-window mirror, persistence.');
} finally {await b.close();}
