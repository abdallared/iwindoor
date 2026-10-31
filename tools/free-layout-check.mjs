import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1100}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
const click=a=>p.locator(`[data-action="${a}"]`).first().click();
const select=n=>p.locator('[data-scope="selection"]').selectOption(String(n));
try{
 await p.goto('http://127.0.0.1:5173');await click('add-item');await p.locator('[data-template="custom"]').click();
 assert.equal(await p.locator('.drawing-stage [data-panel]').count(),1);
 await click('divide3-horizontal');await click('split-vertical');
 await click('vent-add');assert.equal(await p.locator('.drawing-stage .fan-opening').count(),1);
 const diameter=p.locator('[data-scope="vent"][data-key="diameter"]');await diameter.fill('120');await diameter.press('Tab');
 assert.equal(await p.locator('.fan-opening').getAttribute('data-diameter'),'120');
 await select(2);await click('split-vertical');await click('add-sliding');
 await select(4);await click('add-sliding');
 await select(6);await p.locator('[data-mode="awning"]').click();
 assert.equal(await p.locator('.drawing-stage [data-handle="catch"]').count(),1);
 await p.screenshot({path:'screenshots/free-layout-fan.png',fullPage:true});
 await p.reload();assert.equal(await p.locator('.drawing-stage .fan-opening').count(),1);
 await select(0);await click('vent-remove');assert.equal(await p.locator('.drawing-stage .fan-opening').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: free design, nested 3/2 divisions, two independent sliders, bottom tilt, fan size/removal/persistence.');
}finally{await b.close();}
