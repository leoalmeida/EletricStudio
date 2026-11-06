export const wireRoles=[['phase','Fase','F','#30343b'],['neutral','Neutro','N','#2685d5'],['earth','Proteção / terra','PE','#29934c'],['return','Retorno','R','#d66a28'],['data','Dados / sinal','D','#8761ad'],['other','Outro','X','#7d8490']];
export const roleName=role=>wireRoles.find(r=>r[0]===role)?.[1]||role;
export function makeConductor(role='phase',section=2.5,circuitId=''){
 const preset=wireRoles.find(r=>r[0]===role)||wireRoles[0];
 return {id:crypto.randomUUID(),role:preset[0],label:preset[2],section,color:preset[3],stripeColor:role==='earth'?'#e4c72e':'',quantity:1,circuitId};
}
export function validConductors(wires,circuitIds){
 if(!Array.isArray(wires)||wires.length>200)return false;
 const ids=new Set();
 return wires.every(w=>{if(!w||typeof w.id!=='string'||!w.id||ids.has(w.id)||!wireRoles.some(r=>r[0]===w.role)||typeof w.label!=='string'||w.label.length>60||!Number.isFinite(w.section)||w.section<.1||w.section>1000||!Number.isInteger(w.quantity)||w.quantity<1||w.quantity>100||!/^#[0-9a-f]{6}$/i.test(w.color)||typeof w.stripeColor!=='string'||(w.stripeColor!==''&&!/^#[0-9a-f]{6}$/i.test(w.stripeColor))||typeof w.circuitId!=='string'||(w.circuitId&&!circuitIds.has(w.circuitId)))return false;ids.add(w.id);return true;});
}
export function setRouteWires(plan,routeId,wires){
 return {...plan,routes:plan.routes.map(r=>r.id!==routeId?r:{...r,wires,circuitIds:r.circuitIds.length?[...new Set([...r.circuitIds,...wires.map(w=>w.circuitId).filter(Boolean)])]:[]})};
}
export function appendWires(plan,routeIds,templates){
 let result=plan;for(const route of plan.routes.filter(r=>routeIds.includes(r.id))){const wires=[...(route.wires||[]),...templates.map(w=>({...w,id:crypto.randomUUID()}))];if(!validConductors(wires,new Set(plan.circuits.map(c=>c.id))))throw Error('Limite ou propriedades de fios inválidos.');result=setRouteWires(result,route.id,wires);}return result;
}
export function calculateWireSchedule(plan,lengthOf){
 const rows=[];for(const route of plan.routes){const length=lengthOf(plan,route);for(const wire of route.wires||[])rows.push({...wire,routeId:route.id,kind:route.kind,size:route.size,from:plan.objects.find(o=>o.id===route.from)?.tag||'—',to:plan.objects.find(o=>o.id===route.to)?.tag||'—',circuit:plan.circuits.find(c=>c.id===wire.circuitId)?.number||null,routeLength:length,length:length*wire.quantity});}
 const groups=new Map();for(const row of rows){const key=JSON.stringify([row.role,row.label,row.section,row.color.toLowerCase(),row.stripeColor.toLowerCase(),row.circuitId]);const g=groups.get(key)||{...row,key,length:0,segments:0};g.length+=row.length;g.segments++;groups.set(key,g);}
 return {rows,groups:[...groups.values()],totalLength:rows.reduce((sum,r)=>sum+r.length,0)};
}
export function wireAnnotation(w){return `${w.label||wireRoles.find(r=>r[0]===w.role)?.[2]||'Fio'} ${w.quantity}×${String(w.section).replace('.',',')} mm²`;}
// Deslocamentos limitados evitam picos em curvas de retorno ou segmentos curtos.
export function parallelPath(points,offset){
 const normals=points.slice(1).map((b,i)=>{const a=points[i],len=Math.hypot(b.x-a.x,b.y-a.y);return len?{x:-(b.y-a.y)/len,y:(b.x-a.x)/len}:{x:0,y:0};});
 return points.map((p,i)=>{const a=normals[Math.max(0,i-1)]||{x:0,y:0},b=normals[Math.min(normals.length-1,i)]||a,x=a.x+b.x,y=a.y+b.y,len=Math.hypot(x,y);return {x:p.x+(len?x/len:a.x)*offset,y:p.y+(len?y/len:a.y)*offset};});
}
