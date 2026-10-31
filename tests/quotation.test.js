import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,createItem,calculateProject,validateProject} from '../src/core.js';
import {paymentSchedule} from '../src/quotation.js';
test('fixed and area selling prices ignore material markup and apply project discount then tax',()=>{
 const p=createProject();p.items=[{...createItem(),quantity:2,pricing:{mode:'unit',rate:4000}},{...createItem(),width:2000,height:1500,quantity:3,pricing:{mode:'area',rate:5000}}];
 p.settings.markup=900;p.settings.discount=10;p.settings.tax=14;
 const r=calculateProject(p);assert.equal(r.items[0].unitPrice,4000);assert.equal(r.items[1].billableArea,3);assert.equal(r.items[1].unitPrice,15000);assert.equal(r.subtotal,53000);assert.equal(r.total,54378);
 const pay=paymentSchedule(r.total,{depositPercent:50,deliveryPercent:30});assert.equal(pay[2].percent,20);assert.equal(pay.reduce((s,p)=>s+p.amount,0),r.total);
});
test('invalid prices/payment percentages are rejected and old projects remain valid',()=>{
 const p=createProject();assert.deepEqual(validateProject(p),[]);
 p.items[0].pricing={mode:'area',rate:-1};assert(validateProject(p).length);
 delete p.items[0].pricing;p.quotation={depositPercent:80,deliveryPercent:30};assert(validateProject(p).length);
 p.quotation={depositPercent:40,deliveryPercent:40};assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),[]);
});
