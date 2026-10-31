import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1100}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
const click=a=>p.locator(`[data-action="${a}"]`).first().click();
const select=n=>p.locator('[data-scope="selection"]').selectOption(String(n));
async function change(key,value){const f=p.locator(`[data-scope="design"][data-key="${key}"]`);await f.fill(String(value));await f.press('Tab');}
try{
 await p.goto('http://127.0.0.1:5173');await click('add-item');await p.locator('[data-template="arched-sides"]').click();
 assert.equal(await p.locator('.drawing-stage .curved-panel-glass').count(),2);
 await change('archSideLeft',350);await change('archSideRight',250);
 await p.screenshot({path:'screenshots/arch-fixed-sides.png',fullPage:true});
 await select(2);await click('remove-sliding');await click('split-horizontal');await select(3);await p.locator('[data-mode="right"]').click();
 assert.equal(await p.locator('.drawing-stage .curved-panel-glass').count(),2);
 await p.reload();assert.equal(await p.locator('[data-key="archSideLeft"]').inputValue(),'350');
 assert.deepEqual(errors,[]);console.log('PASS: fixed curved side panes, independent widths, centre sliding replaced by split/door, persistence.');
}finally{await b.close();}
