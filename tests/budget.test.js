import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankPlan,makeObject,validatePlan} from '../src/floor/model.js';
import {makeConductor} from '../src/floor/conductors.js';
import {withFloors,addFloor,switchFloor} from '../src/floor/floors.js';
import {budgetDefaults,budgetMaterials,calculateBudget,budgetWorkbook} from '../src/floor/budget.js';
import {makePanelDevice,panelCatalog} from '../src/floor/panels.js';
import {makeLoadXlsx} from '../src/floor/xlsx.js';

function fixture(){const p=blankPlan(),a=makeObject('socketLow',100,100),b=makeObject('socketLow',400,100),w={...makeConductor(),quantity:2};p.objects=[a,b];p.routes=[{id:'r',from:a.id,to:b.id,kind:'conduit',size:'20 mm',points:[],circuitIds:[],wires:[w]}];return p;}
test('levantamento soma pontos, comprimentos e quantidade real de condutores',()=>{
 const rows=budgetMaterials(fixture()).rows;
 assert.equal(rows.find(r=>r.key==='node|socketLow').quantity,2);
 assert.equal(rows.find(r=>r.category==='Infraestrutura').quantity,3);
 assert.equal(rows.find(r=>r.category==='Fios e cabos').quantity,6);
});
test('não presume fios ou disjuntores a partir de símbolos e circuitos',()=>{
 const p=fixture();p.routes[0].wires=[];p.objects.push(makeObject('mainBreaker',500,500));const b=budgetMaterials(p);
 assert.equal(b.noWires,1);assert.equal(b.rows.some(r=>r.category==='Fios e cabos'),false);assert.equal(b.rows.some(r=>r.category==='Proteções'),false);
 const board=makeObject('board',600,600);board.panelLayout={rows:2,slotsPerRow:8,devices:[makePanelDevice(panelCatalog[2])]};p.objects.push(board);
 assert.equal(budgetMaterials(p).rows.find(r=>r.category==='Proteções').quantity,1);
});
test('reserva, mão de obra, desconto e frete totalizam em centavos sem mudar quantidades de pontos',()=>{
 const p=fixture();p.budget=budgetDefaults();p.budget.reservePercent=10;p.budget.discountPercent=10;p.budget.freight=5;
 for(const r of budgetMaterials(p).rows)p.budget.prices[r.key]={unitPrice:r.category==='Fios e cabos'?2.5:0,laborPrice:r.category==='Fios e cabos'?.5:0,included:true};
 const b=calculateBudget(p);assert.equal(b.materialCents,1650);assert.equal(b.laborCents,330);assert.equal(b.discountCents,198);assert.equal(b.totalCents,2282);assert.equal(b.complete,true);
 assert.equal(b.rows.find(r=>r.key==='node|socketLow').quantity,2);
});
test('preços não preenchidos deixam total incompleto e exclusões não entram no total',()=>{
 const p=fixture();assert.equal(calculateBudget(p).missingPrices,3);assert.equal(calculateBudget(p).complete,false);
 p.budget=budgetDefaults();for(const r of budgetMaterials(p).rows)p.budget.prices[r.key]={unitPrice:null,laborPrice:10,included:false};
 const b=calculateBudget(p);assert.equal(b.complete,true);assert.equal(b.totalCents,0);assert.equal(b.missingPrices,0);
});
test('todos os pavimentos consolidam os materiais e preservam preços na troca de andar',()=>{
 const ground=withFloors(fixture());ground.budget=budgetDefaults();ground.budget.prices['node|socketLow']={unitPrice:10,laborPrice:0,included:true};
 let p=addFloor(ground,'Superior');p.objects.push(makeObject('socketLow',200,200));
 assert.equal(budgetMaterials(p,'all').rows.find(r=>r.key==='node|socketLow').quantity,3);
 assert.equal(budgetMaterials(p,'current').rows.find(r=>r.key==='node|socketLow').quantity,1);
 p=validatePlan(JSON.parse(JSON.stringify(p)));p=switchFloor(p,ground.activeFloorId);assert.equal(p.budget.prices['node|socketLow'].unitPrice,10);
});
test('complementos permanecem editáveis e validação rejeita valores financeiros inválidos',()=>{
 const p=fixture();p.budget=budgetDefaults();p.budget.manualItems=[{id:'extra',label:'Instalação',unit:'serviço',quantity:2,unitPrice:50,laborPrice:25,included:true}];
 assert.doesNotThrow(()=>validatePlan(p));assert.equal(calculateBudget(p).totalCents,15000);
 p.budget.manualItems[0].quantity=-1;assert.throws(()=>validatePlan(p));p.budget.manualItems[0].quantity=2;p.budget.freight=Infinity;assert.throws(()=>validatePlan(p));p.budget.freight=0;p.budget.discountPercent=101;assert.throws(()=>validatePlan(p));
});
test('planilha identifica custos pendentes e usa nome Orçamento',()=>{
 const p=fixture(),rows=budgetWorkbook(p),bytes=makeLoadXlsx(rows,'Orçamento'),xml=new TextDecoder().decode(bytes);
 assert.ok(rows.some(r=>r[0]==='Subtotal conhecido — incompleto (R$)'));
 assert.ok(xml.includes('sheet name="Orçamento"'));assert.ok(xml.includes('A informar'));
});
