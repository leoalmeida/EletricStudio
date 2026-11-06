import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,makeCircuit,validatePlan,loadSchedule} from '../src/floor/model.js';
import {outletParts,applyDeviceProperties,commandsOf,controlledCircuits,hasDeviceProperties} from '../src/floor/deviceConfig.js';
test('tomadas múltiplas conservam o total antigo e aceitam circuitos individuais',()=>{
 const p=blankPlan(),board=makeObject('board',100,100),a=makeCircuit(board.id),b=makeCircuit(board.id);b.id='c2';b.number=2;a.voltage=b.voltage=127;p.circuits=[a,b];const o=makeObject('socketDouble',200,200,{power:101,circuitId:a.id});p.objects=[board,o];assert.equal(loadSchedule(p)[0].va,101);
 const parts=outletParts(o);assert.equal(parts.reduce((s,v)=>s+v.power,0),101);parts[1].circuitId=b.id;
 p.objects[1]=applyDeviceProperties(o,{outlets:parts},p);assert.deepEqual(loadSchedule(p).map(r=>r.va),[50.5,50.5]);assert.deepEqual(validatePlan(JSON.parse(JSON.stringify(p))),p);
});
test('tensão incompatível não altera a carga nem o circuito',()=>{
 const p=blankPlan(),b=makeObject('board',100,100),c=makeCircuit(b.id);c.voltage=127;p.circuits=[c];const o=makeObject('socket',200,200,{circuitId:c.id});assert.throws(()=>applyDeviceProperties(o,{voltage:220},p),/127 V/);assert.equal(c.voltage,127);assert.equal(o.voltage,127);
});
test('interruptor triplo associa três comandos às lâmpadas e conserva visibilidade',()=>{
 const p=blankPlan(),b=makeObject('board',100,100),c=makeCircuit(b.id);p.circuits=[c];const o=makeObject('switchTriple',200,200),commands=commandsOf(o);assert.equal(commands.length,3);commands.forEach((v,i)=>v.name=['a','b','c'][i]);commands[1].visible=false;p.objects=[b,applyDeviceProperties(o,{commands},p),makeObject('light',300,300,{control:'a',circuitId:c.id})];assert.deepEqual(controlledCircuits(p,'a'),[c.id]);assert.deepEqual(controlledCircuits(p,'b'),[]);assert.equal(validatePlan(JSON.parse(JSON.stringify(p))).objects[1].commands[1].visible,false);
});
test('telefone configura altura em metros e preserva indicação em milímetros',()=>{
 const p=blankPlan(),o=makeObject('phone',200,200);assert.ok(hasDeviceProperties('phone'));p.objects=[applyDeviceProperties(o,{height:.3,presentation:{height:true}},p)];assert.equal(validatePlan(JSON.parse(JSON.stringify(p))).objects[0].height*1000,300);
});
test('configurações inválidas de tomadas e comandos são rejeitadas',()=>{
 const p=blankPlan(),o=makeObject('socketTriple',200,200);p.objects=[{...o,outlets:outletParts(o).slice(0,2)}];assert.throws(()=>validatePlan(p));p.objects=[{...makeObject('switch',200,200),commands:[{name:'a',visible:'sim'}]}];assert.throws(()=>validatePlan(p));
});
