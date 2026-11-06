import {nodeTypes,nameOf,routeLength} from './model.js';
import {deviceName} from './panels.js';

export const budgetDefaults=()=>({scope:'all',reservePercent:0,discountPercent:0,freight:0,notes:'',prices:{},manualItems:[]});
export const budgetConfig=p=>p.budget||budgetDefaults();
export const reais=n=>n===null?'A informar':(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const roundQuantity=n=>Math.round(n*1000)/1000;
export function budgetMaterials(project,scope='all'){
 const levels=scope==='all'&&project.floors?project.floors.map(f=>f.id===project.activeFloorId?project:{...project,...f.data}):[project],groups=new Map();let missingDevices=0,noWires=0;
 const add=(key,label,category,unit,quantity,unknownSpec=false)=>{const old=groups.get(key)||{key,label,category,unit,quantity:0,unknownSpec};old.quantity+=quantity;groups.set(key,old);};
 for(const p of levels){
  for(const o of p.objects){
   if(nodeTypes.includes(o.type)&&!['mainBreaker','riserUp','riserDown'].includes(o.type))add('node|'+o.type,nameOf(o.type),['board','subBoard'].includes(o.type)?'Quadros':'Pontos elétricos',o.type==='ledStrip'?'m':'un',o.type==='ledStrip'?(o.stripLength??1):1);
   for(const d of o.panelLayout?.devices||[]){
    const residual=['dr','ddr','idr'].includes(d.type),spec=[d.type,d.poles,d.modules,d.type==='dps'?d.surgeKA:d.rating,['mcb','ddr'].includes(d.type)?d.curve:'',residual?d.sensitivity:'',d.type==='dps'?d.voltage:''];
    const label=deviceName(d)+' · '+d.poles+'P · '+(d.type==='dps'?(d.surgeKA??'?')+' kA / '+(d.voltage??'?')+' V':(d.rating??'?')+' A')+(residual?' / '+(d.sensitivity??'?')+' mA':'')+(['mcb','ddr'].includes(d.type)?' · Curva '+d.curve:'');
    add('device|'+JSON.stringify(spec),label,'Proteções','un',1,d.type==='dps'?(d.surgeKA===null||d.voltage===null):d.rating===null);
   }
  }
  const represented=new Set(p.objects.flatMap(o=>(o.panelLayout?.devices||[]).filter(d=>['mcb','ddr'].includes(d.type)).flatMap(d=>d.circuitIds)));
  missingDevices+=p.circuits.filter(c=>!represented.has(c.id)).length;
  for(const r of p.routes){
   add('route|'+r.kind+'|'+r.size.trim().toLowerCase(),nameOf(r.kind)+' · '+r.size,'Infraestrutura','m',routeLength(p,r),r.size==='A confirmar');
   if(!(r.wires||[]).length)noWires++;
   for(const w of r.wires||[]){const key='wire|'+JSON.stringify([w.section,w.color.toLowerCase(),w.stripeColor.toLowerCase()]);add(key,'Condutor '+w.section+' mm² · '+w.color+(w.stripeColor?' / '+w.stripeColor:''),'Fios e cabos','m',routeLength(p,r)*w.quantity);}
  }
 }
 return {rows:[...groups.values()].map(r=>({...r,quantity:roundQuantity(r.quantity)})).sort((a,b)=>a.category.localeCompare(b.category,'pt-BR')||a.label.localeCompare(b.label,'pt-BR')),missingDevices,noWires,levels:levels.length};
}
export function calculateBudget(project){
 const config=budgetConfig(project),materials=budgetMaterials(project,config.scope);
 const rows=[...materials.rows.map(row=>({...row,...(Object.hasOwn(config.prices,row.key)?config.prices[row.key]:{unitPrice:null,laborPrice:0,included:true}),quantity:roundQuantity(row.quantity*(row.unit==='m'?1+config.reservePercent/100:1)),baseQuantity:row.quantity})),...config.manualItems.map(r=>({...r,key:'manual|'+r.id,category:'Complementos',manual:true,baseQuantity:r.quantity,unknownSpec:false}))].map(row=>({...row,materialCents:row.unitPrice===null?null:Math.round(row.quantity*row.unitPrice*100),laborCents:Math.round(row.quantity*row.laborPrice*100)}));
 const included=rows.filter(r=>r.included&&r.quantity>0),missingPrices=included.filter(r=>r.unitPrice===null).length,materialCents=included.reduce((s,r)=>s+(r.materialCents??0),0),laborCents=included.reduce((s,r)=>s+r.laborCents,0),subtotal=materialCents+laborCents,discountCents=Math.round(subtotal*config.discountPercent/100),freightCents=Math.round(config.freight*100);
 return {...materials,config,rows,missingPrices,unknownSpecs:included.filter(r=>r.unknownSpec).length,materialCents,laborCents,discountCents,freightCents,totalCents:subtotal-discountCents+freightCents,complete:missingPrices===0};
}
export function budgetWorkbook(project){
 const b=calculateBudget(project);
 return [['Orçamento',project.name],['Abrangência',b.config.scope==='all'?'Todos os pavimentos':project.floors?.find(f=>f.id===project.activeFloorId)?.name||'Pavimento atual'],['Reserva em metros (%)',b.config.reservePercent],[],['Categoria','Material / serviço','Unidade','Quantidade','Incluído','Preço unitário (R$)','Mão de obra/un. (R$)','Materiais (R$)','Mão de obra (R$)'],...b.rows.map(r=>[r.category,r.label,r.unit,r.quantity,r.included?'Sim':'Não',r.unitPrice??'A informar',r.laborPrice,r.materialCents===null?'A informar':r.materialCents/100,r.laborCents/100]),[],['Materiais conhecidos (R$)',b.materialCents/100],['Mão de obra (R$)',b.laborCents/100],['Desconto (R$)',b.discountCents/100],['Frete (R$)',b.freightCents/100],[b.complete?'Total estimado (R$)':'Subtotal conhecido — incompleto (R$)',b.totalCents/100],['Itens sem preço',b.missingPrices],['Especificações a confirmar',b.unknownSpecs],['Observações',b.config.notes],['Critério','Comprimentos em planta; reserva aplicada apenas aos metros automáticos. Proteções consideradas apenas quando montadas na aba Disjuntores. Preços informados pelo usuário.']];
}
