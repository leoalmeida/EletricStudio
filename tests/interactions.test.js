import {test} from 'node:test';
import assert from 'node:assert/strict';
import {boxSelection,moveSelection,wheelZoom} from '../src/floor/interactions.js';

const fixture=()=>({width:1000,height:800,objects:[{id:'a',type:'light',x:100,y:100},{id:'b',type:'socketLow',x:300,y:200},{id:'wall',type:'wall',x:400,y:300,x2:600,y2:300}],routes:[{id:'r',from:'a',to:'b',points:[{x:200,y:100}],wires:[{color:'blue',section:2.5}]}]});
test('mover grupo preserva distâncias, fios e desloca curvas internas',()=>{
 const p=fixture(),result=moveSelection(p,['a','b'],50,70);
 assert.deepEqual(result.objects.slice(0,2).map(o=>[o.x,o.y]),[[150,170],[350,270]]);
 assert.deepEqual(result.routes[0].points,[{x:250,y:170}]);
 assert.deepEqual(result.routes[0].wires,p.routes[0].wires);
 assert.equal(p.objects[0].x,100);
 assert.deepEqual(result.objects[2],p.objects[2]);
});
test('mover apenas um terminal mantém curvas do percurso',()=>{
 const p=fixture(),result=moveSelection(p,['a'],50,70);
 assert.deepEqual(result.routes,p.routes);
 assert.equal(result.objects[1].x,300);
});
test('paredes movem os dois extremos juntas',()=>{
 const result=moveSelection(fixture(),['wall'],30,40).objects[2];
 assert.deepEqual([result.x,result.y,result.x2,result.y2],[430,340,630,340]);
});
test('limite da planta restringe o deslocamento do grupo inteiro',()=>{
 const result=moveSelection(fixture(),['a','b'],-500,900);
 assert.deepEqual(result.objects.slice(0,2).map(o=>[o.x,o.y]),[[20,680],[220,780]]);
});
test('seleção por área funciona nas duas direções e exige objeto inteiro',()=>{
 const p=fixture(),a={x:50,y:50},b={x:330,y:230};
 assert.deepEqual(boxSelection(p,a,b),['a','b']);
 assert.deepEqual(boxSelection(p,b,a),['a','b']);
 assert.deepEqual(boxSelection(p,a,{x:300,y:200}),['a']);
});
test('zoom da roda respeita direção, unidades e limites',()=>{
 assert.ok(wheelZoom(1,-100)>1);assert.ok(wheelZoom(1,100)<1);
 assert.equal(wheelZoom(1,1,1),wheelZoom(1,16));
 assert.equal(wheelZoom(3,-100),3);assert.equal(wheelZoom(.15,100),.15);
 assert.equal(wheelZoom(1,0),1);
});
