import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,makeCircuit,validatePlan,palette,lightingTypes,loadSchedule} from '../src/floor/model.js';
import {budgetMaterials} from '../src/floor/budget.js';

test('sete opções de iluminação têm persistência e participam dos circuitos',()=>{
 assert.equal(palette.filter(s=>s.category==='Iluminação').length,7);
 const p=blankPlan(),board=makeObject('board',100,100),c=makeCircuit(board.id);p.circuits=[c];p.objects=[board,...lightingTypes.map((t,i)=>makeObject(t,200+i*100,200,{circuitId:c.id,power:10}))];
 assert.deepEqual(validatePlan(JSON.parse(JSON.stringify(p))),p);assert.equal(loadSchedule(p)[0].points,7);assert.equal(loadSchedule(p)[0].va,70);
 assert.equal(makeObject('ledSpot',200,200).power,null);
});
test('fita LED é quantificada em metros e comprimento inválido é rejeitado',()=>{
 const p=blankPlan();p.objects=[makeObject('ledStrip',200,200,{stripLength:3.5}),makeObject('ledStrip',400,200,{stripLength:2})];
 const row=budgetMaterials(p).rows.find(r=>r.key==='node|ledStrip');assert.equal(row.unit,'m');assert.equal(row.quantity,5.5);
 p.objects[0].stripLength=-1;assert.throws(()=>validatePlan(p));
});
