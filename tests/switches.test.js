import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,makeCircuit,validatePlan,switchTypes,palette,loadSchedule} from '../src/floor/model.js';
import {budgetMaterials} from '../src/floor/budget.js';

test('oito opções de interruptores persistem e representam uma unidade de orçamento cada',()=>{
 const p=blankPlan();p.objects=switchTypes.map((type,i)=>makeObject(type,200+i*100,200));
 for(const type of switchTypes)assert.ok(palette.some(s=>s.type===type&&s.category==='Interruptores'));
 assert.deepEqual(validatePlan(JSON.parse(JSON.stringify(p))),p);
 const rows=budgetMaterials(p).rows;assert.equal(rows.length,8);assert.ok(rows.every(r=>r.quantity===1));
});
test('sensor mantém parâmetros informados e carga própria sem contar teclas como cargas',()=>{
 const p=blankPlan(),board=makeObject('board',100,100),c=makeCircuit(board.id);p.circuits=[c];p.objects=[board,...switchTypes.map((t,i)=>makeObject(t,200+i*100,200,{circuitId:c.id} ))];
 assert.equal(loadSchedule(p)[0].points,1);assert.equal(loadSchedule(p)[0].va,null);
 const sensor=p.objects.find(o=>o.type==='presenceSensor');sensor.power=2;sensor.sensorRange=8;sensor.sensorDelay=90;
 assert.equal(loadSchedule(p)[0].va,2);assert.doesNotThrow(()=>validatePlan(p));sensor.sensorDelay=-1;assert.throws(()=>validatePlan(p));
});
