import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,validatePlan} from '../src/floor/model.js';
import {withFloors,addFloor,switchFloor} from '../src/floor/floors.js';
import {buildPlanScene,buildBuildingScene} from '../src/floor/scene3d.js';
import {moduleOf,residentialModules} from '../src/floor/residentialModules.js';

function building(){
 let p=withFloors(blankPlan());
 p.objects=[makeObject('room',100,100,{id:'same-room',x2:500,y2:400,label:'Sala',wallHeight:3})];
 p=addFloor(p,'Superior',false);const upper=p.activeFloorId;
 p.floors=p.floors.map(f=>f.id===upper?{...f,elevation:3.4}:f);
 p.objects=[makeObject('room',100,100,{id:'same-room',x2:500,y2:400,label:'Suíte',wallHeight:3.2})];
 p.roof={version:1,items:[{id:'roof',type:'roofPlane',label:'Telhado',x:300,y:250,width:600,depth:400,height:8,elevation:320,rotation:0,slope:30,color:'#b58067'}]};
 return {p,upper};
}
test('building scene stacks live and stored floor geometry at real elevations without changing the document',()=>{
 const {p,upper}=building(),before=JSON.stringify(p),scene=buildBuildingScene(p,{architecturalOnly:true});
 assert.equal(scene.rooms.length,2);assert.equal(scene.walls.length,8);
 assert.deepEqual(scene.levels.map(f=>f.elevation),[0,3.4]);
 assert.equal(scene.rooms.find(r=>r.floorId===upper).points[0].y,3.4);
 assert.equal(scene.walls.find(w=>w.floorId===upper).a.y,3.4);
 assert.equal(new Set(scene.rooms.map(r=>r.id)).size,2);
 assert.equal(p.floors.find(f=>f.id===upper).data,null);
 assert.equal(JSON.stringify(p),before);
});
test('roof uses local base elevation and slope for complete building bounds',()=>{
 const {p,upper}=building(),scene=buildBuildingScene(p,{architecturalOnly:true}),roof=scene.furnishings[0];
 assert.equal(roof.layer,'roof');assert.equal(roof.baseElevation,3.4);assert.equal(roof.elevation,320);
 assert.ok(Math.abs(scene.bounds.maxY-7.88)<1e-9);assert.equal(scene.bounds.minY,0);
 assert.equal(roof.floorId,upper);
});
test('basements and reordered floors preserve true levels; exploded view is only a preview',()=>{
 let {p}=building();p=addFloor(p,'Subsolo',true);const basement=p.activeFloorId;
 p.floors=p.floors.map(f=>f.id===basement?{...f,elevation:-3}:f).reverse();
 const before=JSON.stringify(p),scene=buildBuildingScene(p,{separation:2});
 assert.deepEqual(scene.levels.map(f=>f.elevation),[-3,0,3.4]);
 assert.deepEqual(scene.levels.map(f=>f.displayElevation),[-3,2,7.4]);
 assert.equal(scene.bounds.minY,-3);assert.equal(JSON.stringify(p),before);
});
test('base scope omits installations and furnishings while keeping shared geometry and roofing',()=>{
 const {p}=building();p.objects.push(makeObject('socket',200,200,{height:.3}));
 p.interiors={version:1,items:[{id:'sofa',type:'sofa',label:'Sofá',x:250,y:250,width:200,depth:90,height:80,rotation:0,color:'#abcdef'}]};
 const complete=buildBuildingScene(p),base=buildBuildingScene(p,{architecturalOnly:true});
 assert.equal(complete.devices.length,1);assert.equal(complete.furnishings.length,2);
 assert.equal(base.devices.length,0);assert.equal(base.furnishings.length,1);assert.equal(base.furnishings[0].type,'roofPlane');
 assert.equal(base.rooms.length,complete.rooms.length);assert.equal(p.interiors.items.length,1);
});
test('room metadata follows custom geometry, explicit height and removed walls',()=>{
 const p=blankPlan();p.objects=[makeObject('room',100,100,{x2:500,y2:400,label:'Cozinha',shape:'l-se',cutWidth:200,cutDepth:150,wallHeight:3.6,removedWalls:[0]})];
 const scene=buildPlanScene(p);assert.equal(scene.rooms[0].area,9);assert.equal(scene.rooms[0].height,3.6);assert.equal(scene.rooms[0].points.length,6);assert.equal(scene.walls.length,5);
});
test('legacy single floors and entirely empty buildings have finite bounds',()=>{
 const p=blankPlan(),scene=buildBuildingScene(p);assert.equal(scene.empty,true);assert.equal(scene.levels.length,1);
 assert.ok(Object.values(scene.bounds).every(Number.isFinite));assert.equal(p.floors,undefined);
});
test('all-floor rendering remains consistent after saving and switching the active floor',()=>{
 const {p}=building(),saved=validatePlan(JSON.parse(JSON.stringify(p))),ground=saved.floors.find(f=>f.name==='Térreo').id;
 const a=buildBuildingScene(saved,{architecturalOnly:true}),b=buildBuildingScene(switchFloor(saved,ground),{architecturalOnly:true});
 assert.deepEqual(a.rooms,b.rooms);assert.deepEqual(a.walls,b.walls);assert.deepEqual(a.furnishings,b.furnishings);
 assert.equal(residentialModules.length,13);assert.equal(moduleOf('plans').label,'Plantas e pavimentos');assert.equal(moduleOf('old-module').id,'architecture');
});
