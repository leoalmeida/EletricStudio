import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,validatePlan,nodeTypes,loadTypes,routePoints} from '../src/floor/model.js';
import {withFloors,addFloor,switchFloor} from '../src/floor/floors.js';
import {budgetMaterials} from '../src/floor/budget.js';

test('marcadores sobe e desce preservam destino e aceitam percursos conectados',()=>{
 let p=withFloors(blankPlan());const ground=p.activeFloorId;p=addFloor(p,'Superior');const upper=p.activeFloorId;p=switchFloor(p,ground);
 const up=makeObject('riserUp',200,200,{tag:'PS1',targetFloorId:upper}),down=makeObject('riserDown',400,200,{tag:'PD1'});
 assert.equal(down.targetFloorId,'');assert.ok(nodeTypes.includes(up.type));assert.ok(!loadTypes.includes(up.type));
 p.objects=[up,down];p.routes=[{id:'r',kind:'conduit',from:up.id,to:down.id,points:[],circuitIds:[],size:'20 mm',wires:[]}];
 p=validatePlan(JSON.parse(JSON.stringify(p)));p=switchFloor(p,upper);p=switchFloor(p,ground);
 assert.equal(p.objects[0].targetFloorId,upper);assert.deepEqual(routePoints(p,p.routes[0]),[{x:200,y:200},{x:400,y:200}]);
 assert.equal(budgetMaterials(p).rows.some(r=>r.key.startsWith('node|riser')),false);
});
test('destinos inválidos são rejeitados sem criar ligações automáticas entre pavimentos',()=>{
 const p=blankPlan(),up=makeObject('riserUp',200,200);p.objects=[up];assert.equal(validatePlan(p).routes.length,0);up.targetFloorId=42;assert.throws(()=>validatePlan(p));
});
