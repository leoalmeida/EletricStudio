import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,makeCircuit,validatePlan,socketTypes,combinedSocketTypes,loadSchedule,palette} from '../src/floor/model.js';
import {budgetMaterials} from '../src/floor/budget.js';

test('tomadas, conjugados e ponto trifásico persistem e somam a potência total cadastrada',()=>{
 const p=blankPlan(),board=makeObject('board',100,100),c=makeCircuit(board.id);c.phase='ABC';c.voltage=220;p.circuits=[c];p.objects=[board,...socketTypes.map((t,i)=>makeObject(t,150+i*100,200,{power:10,circuitId:c.id}))];
 assert.deepEqual(validatePlan(JSON.parse(JSON.stringify(p))),p);const row=loadSchedule(p)[0];assert.equal(row.va,socketTypes.length*10);assert.equal(row.points,socketTypes.length);assert.equal(row.current,row.va/(220*Math.sqrt(3)));
 for(const type of socketTypes)assert.ok(palette.some(s=>s.type===type&&s.category==='Tomadas'));
 assert.equal(makeObject('socketFloor',100,100).height,0);assert.ok(combinedSocketTypes.every(t=>makeObject(t,100,100).power===null));
});
test('orçamento conta cada conjunto conjugado ou múltiplo uma vez',()=>{
 const p=blankPlan();p.objects=['socketDouble','socketTriple',...combinedSocketTypes,'threePhasePower'].map((t,i)=>makeObject(t,200+i*100,200));
 const rows=budgetMaterials(p).rows;assert.equal(rows.length,p.objects.length);assert.ok(rows.every(r=>r.quantity===1&&r.unit==='un'));
});
