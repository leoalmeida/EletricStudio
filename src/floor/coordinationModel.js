import {footprint,withinGarden} from './layoutModel.js';
import {pipePoints} from './hydraulicModel.js';
import {routePoints,nodeTypes} from './model.js';
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function intersects(a,b,c,d){const v=[cross(a,b,c),cross(a,b,d),cross(c,d,a),cross(c,d,b)];if(v.every(x=>Math.abs(x)<.001)){return Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))<=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))&&Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y))<=Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y));}return v[0]*v[1]<=0&&v[2]*v[3]<=0;}
function inBox(p,item){const angle=-item.rotation*Math.PI/180,x=(p.x-item.x)*Math.cos(angle)-(p.y-item.y)*Math.sin(angle),y=(p.x-item.x)*Math.sin(angle)+(p.y-item.y)*Math.cos(angle);return Math.abs(x)<=item.width/2&&Math.abs(y)<=item.depth/2;}
function pathHits(points,item){const box=footprint(item);if(points.some(p=>inBox(p,item)))return true;return points.some((p,i)=>i&&box.some((a,j)=>intersects(points[i-1],p,a,box[(j+1)%4])));}
function boxesOverlap(a,b){const aa=footprint(a),bb=footprint(b);return aa.some(p=>inBox(p,b))||bb.some(p=>inBox(p,a))||aa.some((p,i)=>bb.some((q,j)=>intersects(p,aa[(i+1)%4],q,bb[(j+1)%4])));}
export function coordinationIssues(plan){
 const issues=[],structure=(plan.structure?.items||[]).filter(i=>['column','beam'].includes(i.type)),h=plan.hydraulics||{nodes:[],pipes:[]};
 const add=(kind,a,b,message)=>{if(issues.length<500)issues.push({id:kind+':'+a.id+':'+b.id,kind,from:a.id,to:b.id,x:a.x??b.x,y:a.y??b.y,message});};
 for(const s of structure){
  for(const kind of ['hvac','systems']){const network=plan[kind]||{nodes:[],pipes:[]};for(const n of network.nodes)if(inBox(n,s))add(kind+'-node',n,s,`${n.label} sobre ${s.label}: conferir posição e altura.`);for(const p of network.pipes)if(pathHits(pipePoints(network,p),s))add(kind+'-route',s,p,`${kind==='hvac'?'Rede de climatização':'Rede especial'} cruza ${s.label} em planta: revisar altura e passagem.`);}
  for(const n of h.nodes)if(inBox(n,s))add('hydraulic-node',n,s,`${n.label||'Ponto hidráulico'} sobre ${s.label}: conferir posição e altura.`);
  for(const p of h.pipes)if(pathHits(pipePoints(h,p),s))add('hydraulic-pipe',s,p,`Tubulação hidráulica cruza ${s.label} em planta: conferir passagem e altura.`);
  for(const n of plan.objects.filter(o=>nodeTypes.includes(o.type)))if(inBox(n,s))add('electrical-node',n,s,`${n.tag||'Ponto elétrico'} sobre ${s.label}: conferir posição e altura.`);
  for(const r of plan.routes)if(pathHits(routePoints(plan,r),s))add('electrical-route',s,r,`Percurso elétrico cruza ${s.label} em planta: conferir passagem e altura.`);
  for(const item of plan.interiors?.items||[])if(boxesOverlap(item,s))add('interior',item,s,`${item.label} sobre ${s.label}: revisar a disposição.`);
 }
 for(const item of plan.landscaping?.items||[])if(!withinGarden(plan,item))add('garden',item,item,`${item.label} está fora de um ambiente Jardim.`);
 return issues;
}
