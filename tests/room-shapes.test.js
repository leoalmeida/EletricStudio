import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,validatePlan,nodeTypes} from '../src/floor/model.js';
import {roomPoints,roomArea,roomLabelPoint,roomToolShapes,wallSegments,snapOpening} from '../src/floor/architecture.js';
import {withFloors,addFloor} from '../src/floor/floors.js';
import {moveSelection} from '../src/floor/interactions.js';

test('quatro ferramentas em L geram ambientes com seis vértices e a mesma área útil',()=>{
 for(const [tool,shape]of Object.entries(roomToolShapes)){
  const o=makeObject(tool,100,100,{x2:500,y2:400,cutWidth:250,cutDepth:150});
  assert.equal(o.type,'room');assert.equal(o.shape,shape);assert.equal(roomPoints(o).length,6);assert.equal(wallSegments([o]).length,6);assert.equal(roomArea(o),8.25);assert.equal(nodeTypes.includes(tool),false);
 }
});
test('recorte inferior direito corresponde ao contorno da referência',()=>{
 const o=makeObject('roomLSE',100,100,{x2:500,y2:400,cutWidth:250,cutDepth:150});
 assert.deepEqual(roomPoints(o),[{x:100,y:100},{x:500,y:100},{x:500,y:250},{x:250,y:250},{x:250,y:400},{x:100,y:400}]);
 assert.deepEqual(roomLabelPoint(o),{x:300,y:175});
 const inverted={...o,x:500,y:400,x2:100,y2:100};assert.deepEqual(roomPoints(inverted),roomPoints(o));
});
test('portas encaixam na parede interna do L sem criar parede no canto removido',()=>{
 const p=blankPlan();p.objects=[makeObject('roomLSE',100,100,{x2:500,y2:400,cutWidth:250,cutDepth:150})];
 const door=snapOpening(p,makeObject('door',255,280,{width:80}));assert.equal(door.x,250);assert.equal(door.rotation,0);
 const outside=makeObject('window',490,350,{width:80});assert.equal(snapOpening(p,outside),outside);
});
test('formatos e recortes persistem, movem juntos e acompanham a cópia de pavimento',()=>{
 let p=withFloors(blankPlan());p.objects=[makeObject('roomLNW',100,100,{x2:500,y2:400,cutWidth:150,cutDepth:100})];
 p=validatePlan(JSON.parse(JSON.stringify(p)));const moved=moveSelection(p,[p.objects[0].id],40,50);
 assert.deepEqual(roomPoints(moved.objects[0]),roomPoints(p.objects[0]).map(v=>({x:v.x+40,y:v.y+50})));
 const copy=addFloor(p,'Superior',true);assert.equal(copy.objects[0].shape,'l-nw');assert.equal(copy.objects[0].cutWidth,150);assert.equal(copy.objects[0].cutDepth,100);
});
test('retângulos antigos conservam geometria e recortes inválidos são rejeitados',()=>{
 const p=blankPlan(),o=makeObject('room',100,100,{x2:500,y2:400});p.objects=[o];assert.equal(roomPoints(o).length,4);assert.equal(roomArea(o),12);assert.doesNotThrow(()=>validatePlan(p));
 o.shape='l-se';o.cutWidth=400;assert.throws(()=>validatePlan(p));o.cutWidth=100;o.cutDepth=-1;assert.throws(()=>validatePlan(p));o.cutDepth=100;o.shape='triangulo';assert.throws(()=>validatePlan(p));
});
