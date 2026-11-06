import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,examplePlan,makeObject,nodeTypes,validatePlan} from '../src/floor/model.js';
import {withFloors,switchFloor,addFloor,deleteFloor} from '../src/floor/floors.js';
import {wallSegments,snapOpening,projectToWall} from '../src/floor/architecture.js';

test('troca de pavimento conserva desenhos, circuitos e fios sem compartilhar alterações',()=>{
 const ground=withFloors(examplePlan());let p=addFloor(ground,'Superior');const upper=p.activeFloorId;
 assert.equal(p.objects.length,0);assert.equal(p.circuits.length,0);
 p.objects.push(makeObject('window',100,100));
 p=switchFloor(p,ground.activeFloorId);assert.deepEqual(p.objects,ground.objects);assert.deepEqual(p.routes,ground.routes);
 p=switchFloor(p,upper);assert.equal(p.objects.length,1);assert.equal(p.objects[0].type,'window');
 p=validatePlan(JSON.parse(JSON.stringify(p)));p=switchFloor(p,ground.activeFloorId);assert.deepEqual(p.routes,ground.routes);
});
test('cópia de arquitetura cria IDs novos sem copiar pontos ou circuitos',()=>{
 const p=withFloors(examplePlan()),copy=addFloor(p,'1º andar',true);
 assert.ok(copy.objects.length>0);assert.ok(copy.objects.every(o=>!nodeTypes.includes(o.type)));
 assert.ok(copy.objects.every(o=>!p.objects.some(original=>original.id===o.id)));
 assert.equal(copy.routes.length,0);assert.equal(copy.circuits.length,0);assert.doesNotThrow(()=>validatePlan(copy));
});
test('exclusão do pavimento ativo conserva outro e mantém ao menos um',()=>{
 const ground=withFloors(examplePlan()),p=addFloor(ground,'Superior'),result=deleteFloor(p,p.activeFloorId);
 assert.equal(result.activeFloorId,ground.activeFloorId);assert.deepEqual(result.objects,ground.objects);assert.equal(result.floors.length,1);
 assert.equal(deleteFloor(result,result.activeFloorId),result);
});
test('validação rejeita pavimentos duplicados, dados inválidos e conteúdo aninhado',()=>{
 let p=addFloor(withFloors(blankPlan()),'Superior');p.floors[0].data.objects.push({type:'invalid'});assert.throws(()=>validatePlan(p));
 p=withFloors(blankPlan());p.floors.push({...p.floors[0]});assert.throws(()=>validatePlan(p));
 p=addFloor(withFloors(blankPlan()),'Superior');p.floors[0].data.floors=[];assert.throws(()=>validatePlan(p));
});
test('aberturas são arquitetônicas e conservam altura e peitoril ao salvar',()=>{
 const p=blankPlan();p.objects=['window','slidingDoor','door'].map((t,i)=>makeObject(t,200+i*200,200));
 assert.ok(p.objects.every(o=>!nodeTypes.includes(o.type)));assert.deepEqual(validatePlan(JSON.parse(JSON.stringify(p))),p);
 assert.equal(p.objects[0].sill,1.1);assert.equal(p.objects[1].openingHeight,2.1);
});
test('encaixe de janela na parede alinha, orienta e restringe o vão aos limites',()=>{
 const p=blankPlan();p.objects=[makeObject('room',100,100,{x2:500,y2:400,width:15})];
 const o=snapOpening(p,makeObject('window',470,105,{width:120}));
 assert.equal(o.y,100);assert.equal(o.x,380);assert.equal(o.rotation,270);assert.equal(o.wallThickness,15);
 const vertical=snapOpening(p,makeObject('slidingDoor',498,150,{width:160}));assert.equal(vertical.x,500);assert.equal(vertical.rotation,0);
 assert.equal(wallSegments(p.objects).length,4);
});
test('paredes diagonais projetam posição sem divisão por zero e vãos distantes não encaixam',()=>{
 const wall={a:{x:100,y:100},b:{x:300,y:300}};const p=projectToWall({x:200,y:200},wall);assert.equal(p.t,.5);assert.equal(p.distance,0);
 assert.equal(projectToWall({x:0,y:0},{a:{x:1,y:1},b:{x:1,y:1}}),null);
 const plan=blankPlan();plan.objects=[makeObject('wall',100,100,{x2:300,y2:100})];const o=makeObject('door',800,800);assert.equal(snapOpening(plan,o),o);
});

test('disjuntor desconhecido sobrevive à troca de pavimento e gravação JSON',()=>{
 const ground=withFloors(examplePlan());ground.mainRating=null;
 let p=addFloor(ground,'Superior');
 assert.equal(p.floors.find(f=>f.id===ground.activeFloorId).data.mainRating,null);
 p=validatePlan(JSON.parse(JSON.stringify(p)));p=switchFloor(p,ground.activeFloorId);
 assert.equal(p.mainRating,null);assert.equal(validatePlan(JSON.parse(JSON.stringify(p))).mainRating,null);
});

test('importação recupera corrente omitida em arquivos antigos sem alterar o original',()=>{
 const original=withFloors(examplePlan());delete original.mainRating;
 let p=addFloor(original,'Superior');delete p.floors[0].data.mainRating;delete p.mainRating;
 const loaded=validatePlan(p);assert.equal(loaded.mainRating,null);assert.equal(loaded.floors[0].data.mainRating,null);
 assert.equal(Object.hasOwn(p,'mainRating'),false);assert.equal(Object.hasOwn(p.floors[0].data,'mainRating'),false);
 assert.equal(switchFloor(loaded,loaded.floors[0].id).mainRating,null);
 assert.deepEqual(loaded.objects,p.objects);assert.deepEqual(loaded.floors[0].data.objects,p.floors[0].data.objects);
});

test('correntes explicitamente inválidas continuam rejeitadas na importação',()=>{
 const p=examplePlan();for(const value of [-1,0,'40',{}]){p.mainRating=value;assert.throws(()=>validatePlan(p));}
});

test('novas aberturas e escada são arquitetônicas e acompanham cópia entre pavimentos',()=>{
 let p=withFloors(blankPlan());p.objects=['opening','slidingDoorSingle','slidingDoor','stairs'].map((type,i)=>makeObject(type,200+i*250,200));
 assert.ok(p.objects.every(o=>!nodeTypes.includes(o.type)));
 assert.equal(p.objects[3].steps,12);assert.equal(p.objects[3].stairLength,280);
 p=validatePlan(JSON.parse(JSON.stringify(p)));const copy=addFloor(p,'Cópia',true);
 assert.deepEqual(copy.objects.map(o=>o.type),p.objects.map(o=>o.type));assert.equal(copy.objects[3].steps,12);
 const invalid=structuredClone(copy);invalid.objects[3].steps=2.5;assert.throws(()=>validatePlan(invalid));
});

test('abertura e porta de uma folha encaixam nas paredes sem trocar o tipo',()=>{
 const p=blankPlan();p.objects=[makeObject('wall',100,100,{x2:600,y2:100,width:15})];
 for(const type of ['opening','slidingDoorSingle']){const o=snapOpening(p,makeObject(type,200,105));assert.equal(o.type,type);assert.equal(o.y,100);assert.equal(o.rotation,270);assert.equal(o.wallThickness,15);}
});
