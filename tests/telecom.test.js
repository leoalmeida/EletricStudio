import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,validatePlan,palette,nodeTypes,routePoints} from '../src/floor/model.js';
import {budgetMaterials} from '../src/floor/budget.js';

test('telecomunicações reúne as cinco opções sem duplicar campainha e botão',()=>{
 const entries=palette.filter(s=>s.category==='Telecomunicações');
 assert.deepEqual(entries.map(s=>s.label),['Tomada de telefone','Campainha','Botão de campainha','RJ45','Câmera']);
 for(const type of ['phone','bell','bellPush','data','camera']){assert.ok(nodeTypes.includes(type));assert.equal(palette.filter(s=>s.type===type).length,1);}
});
test('pontos de telecom persistem, conectam percursos e entram no orçamento como unidades',()=>{
 const p=blankPlan();p.objects=['phone','bell','bellPush','data','camera'].map((type,i)=>makeObject(type,200+i*100,200));
 p.routes=[{id:'telecom-route',kind:'conduit',from:p.objects[3].id,to:p.objects[4].id,points:[],circuitIds:[],size:'20 mm',wires:[]}];
 const loaded=validatePlan(JSON.parse(JSON.stringify(p)));assert.deepEqual(loaded,p);assert.equal(routePoints(loaded,loaded.routes[0]).length,2);
 const rows=budgetMaterials(p).rows.filter(r=>r.category==='Pontos elétricos');assert.equal(rows.length,5);assert.ok(rows.every(r=>r.quantity===1));
});
