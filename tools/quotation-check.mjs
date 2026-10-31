import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1100}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
async function change(scope,key,value){const f=p.locator(`[data-scope="${scope}"][data-key="${key}"]`).first();await f.fill(String(value));await f.press('Tab');}
try{
 await p.goto('http://127.0.0.1:5173');await p.locator('[data-action="nav-reports"]').first().click();
 await p.locator('[data-scope="pricing"][data-key="mode"]').first().selectOption('unit');await change('pricing','rate',4000);
 await change('quotation','business','ورشة الأمل للألومنيوم');await change('quotation','phone','01000000000');
 await change('quotation','depositPercent',40);await change('quotation','deliveryPercent',30);
 assert.equal(await p.locator('.quote-line').count(),1);assert.equal(await p.locator('.payment-table tbody tr').count(),3);
 assert((await p.locator('.quote-line').innerText()).includes('4,000'));
 await p.reload();await p.locator('[data-action="nav-reports"]').first().click();assert.equal(await p.locator('[data-scope="pricing"][data-key="rate"]').inputValue(),'4000');
 await p.locator('#language').selectOption('ar');
 await p.locator('[data-scope="settings"][data-key="currency"]').selectOption('EGP');
 await p.locator('.project-details summary').click();
 await change('project','customer','عميل تجريبي');await change('project','name','مقايسة تجريبية — شبابيك');
 await p.emulateMedia({media:'print'});assert.equal(await p.locator('.quote-editor').isVisible(),false);
 await p.pdf({path:'screenshots/client-quotation.pdf',format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'10mm',right:'10mm'}});
 await p.emulateMedia({media:'screen'});await p.locator('.quote-sheet').screenshot({path:'screenshots/client-quotation.png'});
 assert.deepEqual(errors,[]);console.log('PASS: selling prices, company details, payment stages, persistence, print layout and A4 PDF generated.');
}finally{await b.close();}
