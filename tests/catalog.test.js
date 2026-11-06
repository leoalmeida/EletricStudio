import{test}from'node:test';
import assert from'node:assert/strict';
import{library,categories,filterLibrary,ports,unsupportedComponents}from'../src/catalog.js';
import{component,terminals,validate,solve,example}from'../src/model.js';

const project=(components,wires=[])=>({version:1,name:'Teste',components,wires});
const wire=(a,ap,b,bp)=>({id:crypto.randomUUID(),from:{component:a.id,pin:ap},to:{component:b.id,pin:bp}});
test('todas as 27 famílias do guia têm entrada com terminais válidos e persistência',()=>{
 assert.equal(new Set(library.map(x=>x.type)).size,library.length);
 for(let page=4;page<=30;page++)assert.ok(library.some(x=>x.guide.includes(page)),`Página ${page} sem cobertura`);
 for(const s of library){const c=component(s.type,80,80);assert.ok(categories.includes(s.category));assert.equal(terminals(c).length,c.pins.length);assert.equal(new Set(ports(c).map(p=>p.join(','))).size,ports(c).length);assert.deepEqual(validate(JSON.parse(JSON.stringify(project([c])))),project([c]));}
});
test('busca ignora acentos e combina categoria e disponibilidade',()=>{
 assert.ok(filterLibrary('fusivel').some(s=>s.type==='fuse'));
 assert.ok(filterLibrary('trifasico','Motores','drawing').some(s=>s.type==='motor3'));
 assert.ok(filterLibrary('','Motores','logic').every(s=>s.available==='logic'&&s.category==='Motores'));
 assert.equal(filterLibrary('zzzzzz').length,0);
});
test('símbolo sem modelo bloqueia a simulação mesmo quando desconectado',()=>{
 const p=example();p.components.push(component('inverter',900,80));assert.equal(unsupportedComponents(p).length,1);const s=solve(p);assert.match(s.fault,/somente desenho/);assert.equal(Object.keys(s.powered).length,0);
});
test('contatos térmicos NA e NF com a mesma TAG acompanham o disparo',()=>{
 const l=component('source',40,40),n=component('neutral',40,500),nf=component('overload',40,120,'F1'),na=component('overloadNA',200,120,'F1'),h1=component('lamp',40,280),h2=component('lamp',200,280);
 const p=project([l,n,nf,na,h1,h2],[wire(l,0,nf,0),wire(nf,1,h1,0),wire(h1,1,n,0),wire(l,0,na,0),wire(na,1,h2,0),wire(h2,1,n,0)]);
 let s=solve(p);assert.equal(s.powered[h1.id],true);assert.equal(s.powered[h2.id],false);
 s=solve(p,{[nf.id]:true},s.coils,s.elapsed);assert.equal(s.powered[h1.id],false);assert.equal(s.powered[h2.id],true);
});
test('disjuntor bipolar acopla os polos sem criar ponte entre eles',()=>{
 const l=component('source',40,40),n=component('neutral',40,500),q=component('breaker2',40,100),h=component('lamp',40,250);
 const p=project([l,n,q,h],[wire(l,0,q,0),wire(q,2,h,0),wire(h,1,q,3),wire(q,1,n,0)]);
 let s=solve(p);assert.equal(s.fault,null);assert.equal(s.powered[h.id],true);
 s=solve(p,{[q.id]:true},s.coils,s.elapsed);assert.equal(s.powered[h.id],false);
});
test('contator completo energiza a bobina e fecha contato principal integrado',()=>{
 const l=component('source',40,40),n=component('neutral',40,500),k=component('powerContactor',40,100,'K1'),h=component('lamp',400,250);
 const p=project([l,n,k,h],[wire(l,0,k,0),wire(k,1,n,0),wire(l,0,k,2),wire(k,3,h,0),wire(h,1,n,0)]);
 const s=solve(p);assert.equal(s.coils.K1,true);assert.equal(s.powered[h.id],true);assert.equal(s.fault,null);
});
test('TOF e contato reversível mantêm saída após desligar e retornam após o tempo',()=>{
 const l=component('source',40,40),n=component('neutral',40,500),q=component('isolator',40,100),t=component('timerOff',40,250,'T1'),c=component('timerChangeover',300,100,'T1'),h=component('lamp',300,250);
 t.delay=.15;
 const p=project([l,n,q,t,c,h],[wire(l,0,q,0),wire(q,1,t,0),wire(t,1,n,0),wire(l,0,c,0),wire(c,2,h,0),wire(h,1,n,0)]);
 let s=solve(p);assert.equal(s.coils.T1,false);assert.equal(s.powered[h.id],false);
 s=solve(p,{[q.id]:true},s.coils,s.elapsed);assert.equal(s.coils.T1,true);assert.equal(s.powered[h.id],true);
 s=solve(p,{},s.coils,s.elapsed);assert.equal(s.coils.T1,true);assert.equal(s.powered[h.id],true);
 for(let i=0;i<3;i++)s=solve(p,{},s.coils,s.elapsed);
 assert.equal(s.coils.T1,false);assert.equal(s.powered[h.id],false);
});
test('PE não é tratado como neutro na carga monofásica',()=>{
 const l=component('source',40,40),pe=component('ground',40,500),m=component('motor1',40,250);
 const p=project([l,pe,m],[wire(l,0,m,0),wire(m,1,pe,0)]);assert.equal(solve(p).powered[m.id],false);
});
