import {test} from 'node:test';
import assert from 'node:assert/strict';
import {examplePlan,validatePlan} from '../src/floor/model.js';
import {withFloors,addFloor,switchFloor} from '../src/floor/floors.js';
import {panelCatalog,makePanelDevice,panelLayout,placeDevice,freePosition,validPanelLayout,populatePanel} from '../src/floor/panels.js';

test('quadros antigos começam com dois trilhos vazios sem inventar dispositivos',()=>{
 const p=examplePlan(),b=p.objects.find(o=>o.type==='board');assert.deepEqual(panelLayout(b),{rows:2,slotsPerRow:8,devices:[]});assert.equal(Object.hasOwn(b,'panelLayout'),false);
});
test('dispositivos multipolares ocupam módulos contíguos e nunca atravessam trilhos',()=>{
 let layout={rows:2,slotsPerRow:4,devices:[]};layout=placeDevice(layout,makePanelDevice(panelCatalog[2],0,0));
 assert.deepEqual(freePosition(layout,2),{row:1,slot:0});
 assert.throws(()=>placeDevice(layout,makePanelDevice(panelCatalog[1],0,2)));
 assert.throws(()=>placeDevice(layout,makePanelDevice(panelCatalog[1],1,3)));
 assert.equal(layout.devices.length,1);
});
test('movimentação remove a antiga ocupação e rejeita sobreposição sem alterar origem',()=>{
 let layout={rows:2,slotsPerRow:8,devices:[]};const a=makePanelDevice(panelCatalog[1]),b=makePanelDevice(panelCatalog[0],0,2);layout=placeDevice(placeDevice(layout,a),b);
 const moved=placeDevice(layout,{...a,row:1,slot:3});assert.equal(moved.devices.length,2);assert.equal(moved.devices.find(d=>d.id===a.id).row,1);assert.equal(layout.devices[0].row,0);
 assert.throws(()=>placeDevice(layout,{...a,slot:1}));
});
test('preenchimento aproveita polos, correntes e circuitos sem duplicar existentes',()=>{
 const p=examplePlan(),board=p.objects.find(o=>o.type==='board');const first=populatePanel(p,board);assert.equal(first.added,2);assert.equal(first.layout.devices[0].rating,10);
 board.panelLayout=first.layout;assert.equal(populatePanel(p,board).added,0);
 const sub=p.objects.find(o=>o.type==='subBoard'),b=populatePanel(p,sub).layout.devices[0];assert.equal(b.poles,2);assert.equal(b.modules,2);assert.equal(b.rating,20);
});
test('fase desconhecida não gera um disjuntor de polos presumidos e falta de espaço é sinalizada',()=>{
 const p=examplePlan(),board=p.objects.find(o=>o.type==='board');p.circuits[0].phase='?';assert.equal(populatePanel(p,board).unknown,1);
 p.circuits[0].phase='ABC';p.circuits[1].phase='ABC';board.panelLayout={rows:1,slotsPerRow:4,devices:[]};const result=populatePanel(p,board);assert.equal(result.added,1);assert.equal(result.full,1);
});
test('DR, DDR, IDR e DPS conservam ajustes e associações ao salvar e trocar pavimentos',()=>{
 let p=withFloors(examplePlan());const ground=p.activeFloorId,board=p.objects.find(o=>o.type==='board');let layout={rows:2,slotsPerRow:8,devices:[]};
 for(const preset of panelCatalog.slice(3)){const pos=freePosition(layout,preset.modules);const d={...makePanelDevice(preset,pos.row,pos.slot),rating:63,sensitivity:30,surgeKA:20,voltage:275,circuitIds:[p.circuits[0].id]};layout=placeDevice(layout,d);}
 board.panelLayout=layout;p=addFloor(p,'Superior');p=validatePlan(JSON.parse(JSON.stringify(p)));p=switchFloor(p,ground);assert.deepEqual(p.objects.find(o=>o.id===board.id).panelLayout,layout);
});
test('importação rejeita circuito inexistente, sobreposição e painel em objeto incompatível',()=>{
 const p=examplePlan(),board=p.objects.find(o=>o.type==='board'),d=makePanelDevice();board.panelLayout={rows:2,slotsPerRow:8,devices:[d]};
 d.circuitIds=['ausente'];assert.throws(()=>validatePlan(p));d.circuitIds=[];
 board.panelLayout.devices.push({...d,id:'other'});assert.throws(()=>validatePlan(p));board.panelLayout.devices.pop();
 p.objects.find(o=>o.type==='light').panelLayout=board.panelLayout;assert.throws(()=>validatePlan(p));
 assert.equal(validPanelLayout({rows:0,slotsPerRow:8,devices:[]},new Set()),false);
});
