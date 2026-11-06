export const isSegment=o=>['room','wall','dimension'].includes(o.type);
export function objectBounds(o){
 if(o.type==='stairs'){const angle=o.rotation*Math.PI/180,points=[[-o.width/2,0],[o.width/2,0],[-o.width/2,o.stairLength||280],[o.width/2,o.stairLength||280]].map(([x,y])=>({x:o.x+x*Math.cos(angle)-y*Math.sin(angle),y:o.y+x*Math.sin(angle)+y*Math.cos(angle)}));return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};}
 if(isSegment(o))return {left:Math.min(o.x,o.x2),right:Math.max(o.x,o.x2),top:Math.min(o.y,o.y2),bottom:Math.max(o.y,o.y2)};
 if(['door','window','opening','slidingDoorSingle','slidingDoor'].includes(o.type)){
  const angle=o.rotation*Math.PI/180,t=(o.wallThickness||16)/2,xMax=o.type==='door'&&!o.flip?o.width:t,xMin=o.type==='door'&&o.flip?-o.width:-t;
  const corners=[[xMin,0],[xMax,0],[xMin,o.width],[xMax,o.width]].map(([x,y])=>({x:o.x+x*Math.cos(angle)-y*Math.sin(angle),y:o.y+x*Math.sin(angle)+y*Math.cos(angle)}));
  return {left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
 }
 return {left:o.x-20,right:o.x+20,top:o.y-20,bottom:o.y+20};
}
export function selectionBounds(plan,ids){const bounds=plan.objects.filter(o=>ids.includes(o.id)).map(objectBounds);if(!bounds.length)return null;return {left:Math.min(...bounds.map(b=>b.left)),right:Math.max(...bounds.map(b=>b.right)),top:Math.min(...bounds.map(b=>b.top)),bottom:Math.max(...bounds.map(b=>b.bottom))};}
export function boxSelection(plan,a,b){const box={left:Math.min(a.x,b.x),right:Math.max(a.x,b.x),top:Math.min(a.y,b.y),bottom:Math.max(a.y,b.y)};return plan.objects.filter(o=>{const r=objectBounds(o);return r.left>=box.left&&r.right<=box.right&&r.top>=box.top&&r.bottom<=box.bottom;}).map(o=>o.id);}
export function moveSelection(plan,ids,dx,dy){
 const set=new Set(ids),bounds=selectionBounds(plan,ids);if(!bounds)return plan;
 // Inclui as curvas dos percursos internos nos limites da movimentação.
 const points=plan.routes.filter(r=>set.has(r.from)&&set.has(r.to)).flatMap(r=>r.points);
 const left=Math.min(bounds.left,...points.map(p=>p.x)),right=Math.max(bounds.right,...points.map(p=>p.x)),top=Math.min(bounds.top,...points.map(p=>p.y)),bottom=Math.max(bounds.bottom,...points.map(p=>p.y));
 dx=Math.max(-left,Math.min(plan.width-right,dx));dy=Math.max(-top,Math.min(plan.height-bottom,dy));
 return {...plan,objects:plan.objects.map(o=>!set.has(o.id)?o:{...o,x:o.x+dx,y:o.y+dy,...(isSegment(o)?{x2:o.x2+dx,y2:o.y2+dy}:{})}),routes:plan.routes.map(r=>set.has(r.from)&&set.has(r.to)?{...r,points:r.points.map(p=>({x:p.x+dx,y:p.y+dy}))}:r)};
}
export function wheelZoom(current,delta,mode=0){const pixels=delta*(mode===1?16:mode===2?400:1);return Math.max(.15,Math.min(3,current*Math.exp(-Math.max(-300,Math.min(300,pixels))*.002)));}
