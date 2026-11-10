import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject} from '../src/floor/model.js';
import {buildPlanScene} from '../src/floor/scene3d.js';
import {withFloors,addFloor,switchFloor} from '../src/floor/floors.js';

test('3D uses metres, room polygons and deduplicates coincident walls',()=>{
 const p=blankPlan();p.objects=[makeObject('room',100,100,{x2:500,y2:500,shape:'l-se'}),makeObject('wall',100,100,{x2:500,y2:100})];
 const s=buildPlanScene(p);assert.equal(s.rooms[0].points.length,6);assert.equal(s.walls.length,6);assert.deepEqual(s.walls[0].a,{x:1,y:0,z:1});assert.equal(s.walls[0].length,4);
});
test('3D openings preserve doorway height and window sill without mutating document',()=>{
 const p=blankPlan();p.objects=[makeObject('wall',100,100,{x2:100,y2:800}),makeObject('door',100,400,{width:90,rotation:180,openingHeight:2.2}),makeObject('window',100,600,{width:100,rotation:180,sill:1.2,openingHeight:1})];
 const before=JSON.stringify(p),s=buildPlanScene(p);assert.equal(s.walls[0].openings.length,2);assert.equal(s.walls[0].openings[0].height,2.2);assert.equal(s.walls[0].openings[0].bottom,0);assert.equal(s.walls[0].openings[1].bottom,1.2);assert.equal(JSON.stringify(p),before);
});
test('unknown and independent outlet heights stay explicit; defaults only affect preview',()=>{
 const p=blankPlan();p.objects=[makeObject('socketDouble',200,200,{outlets:[{height:.3},{height:1.2}]}),makeObject('light',400,400,{height:null})];
 const s=buildPlanScene(p);assert.deepEqual(s.devices.slice(0,2).map(d=>d.position.y),[.3,1.2]);assert.equal(s.devices[2].position,null);assert.equal(s.unknown,1);
 assert.equal(buildPlanScene(p,{defaults:true}).devices[2].assumed,true);assert.equal(p.objects[1].height,null);
});
test('route elevations include endpoint drops, bend points and conductor colours',()=>{
 const p=blankPlan(),a=makeObject('socket',100,100,{height:.3}),b=makeObject('light',400,300,{height:2.7});p.objects=[a,b];p.routes=[{id:'r',from:a.id,to:b.id,points:[{x:400,y:100}],kind:'conduit',mountingHeight:2.5,wires:[{color:'#123456'}]}];
 const r=buildPlanScene(p).routes[0];assert.equal(r.points.length,5);assert.equal(r.points[0].y,.3);assert.equal(r.points[1].y,2.5);assert.deepEqual(r.points[2],{x:4,y:2.5,z:1});assert.equal(r.points[4].y,2.7);assert.equal(r.wires[0].color,'#123456');assert.equal(r.assumed,false);
 p.routes[0].to='missing';assert.equal(buildPlanScene(p).routes.length,0);
});
test('3D floor selection uses current unsaved data and does not change active floor',()=>{
 let p=withFloors(blankPlan());p.objects=[makeObject('room',100,100)];const original=p.activeFloorId;p=addFloor(p,'Superior',false);p.objects=[makeObject('socket',600,600,{height:.4})];
 const downstairs=switchFloor(p,original);assert.equal(buildPlanScene(downstairs).rooms.length,1);assert.equal(buildPlanScene(p).devices.length,1);assert.notEqual(p.activeFloorId,original);
});
test('empty floors have finite bounds and no degenerate wall geometry',()=>{
 const p=blankPlan();p.objects=[makeObject('wall',100,100,{x2:100,y2:100})];const s=buildPlanScene(p);assert.equal(s.walls.length,0);assert.equal(s.empty,true);assert.ok(Number.isFinite(s.bounds.maxX));
});


test('3D frames furniture and shared terrain even before walls are drawn',()=>{const p=blankPlan();p.interiors={version:1,items:[{id:'f',type:'sofa',label:'Sofá',x:400,y:400,width:220,depth:90,height:85,rotation:90,color:'#abcdef'}]};let scene=buildPlanScene(p);assert.equal(scene.empty,false);assert.equal(scene.furnishings.length,1);assert.ok(scene.bounds.minX<4&&scene.bounds.maxX>4);p.site={version:1,items:[{id:'site',type:'lot',label:'Lote',x:800,y:550,width:1200,depth:900,height:0,rotation:0,color:'#abcdef'}]};scene=buildPlanScene(p);assert.equal(scene.furnishings.at(-1).layer,'terrain');assert.equal(scene.bounds.maxX,14);});
