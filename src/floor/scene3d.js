import {footprint} from './layoutModel.js';
import {wallSegments,roomPoints} from './architecture.js';
import {wallScene} from './wallScene.js';
import {nodeTypes,boardTypes,lightingTypes,routePoints} from './model.js';
import {outletParts,socketConfigTypes} from './deviceConfig.js';

// Coordinates in the document are centimetres; the 3D scene uses metres, Y up.
export const point3d=(p,height=0)=>({x:p.x/100,y:height,z:p.y/100});
export function buildPlanScene(plan,{defaults=false}={}){
 const seen=new Set();
 const walls=wallSegments(plan.objects).filter(w=>{
  if(Math.hypot(w.b.x-w.a.x,w.b.y-w.a.y)<.01)return false;
  const ends=[`${w.a.x},${w.a.y}`,`${w.b.x},${w.b.y}`].sort();
  const key=ends.join('|')+`|${w.width}|${w.height}`;
  if(seen.has(key))return false;seen.add(key);return true;
 }).map(w=>{
  const scene=wallScene(plan,w);
  return {...w,a:point3d(w.a),b:point3d(w.b),width:w.width/100,length:scene.length/100,
   openings:scene.openings.map(({o,x,width})=>{const bottom=o.type==='window'?(o.sill??1.1):0;
    return {id:o.id,type:o.type,shape:o.windowShape,x:x/100,width:width/100,bottom,height:Math.max(0,Math.min(w.height-bottom,o.openingHeight??(o.type==='window'?1.2:2.1)))};}).filter(o=>o.height>0)};
 });
 const ceiling=Math.max(2.8,...walls.map(w=>w.height));
 const devices=plan.objects.filter(o=>nodeTypes.includes(o.type)).flatMap(o=>{
  const parts=socketConfigTypes.includes(o.type)?outletParts(o):[o];
  return parts.map((part,index)=>{
   const assumed=!Number.isFinite(part.height),preset=boardTypes.includes(o.type)?1.5:o.type==='wallLight'?2:o.type.startsWith('switch')?1.2:lightingTypes.includes(o.type)?ceiling-.1:.3;
   return {id:o.id,key:o.id+'-'+index,type:o.type,tag:o.tag,rotation:o.rotation||0,circuitId:part.circuitId||o.circuitId,assumed,
    position:assumed&&!defaults?null:point3d({x:o.x+index*12*Math.cos((o.rotation||0)*Math.PI/180),y:o.y+index*12*Math.sin((o.rotation||0)*Math.PI/180)},assumed?preset:part.height)};
  });
 });
 const byId=new Map(devices.filter(d=>d.position).map(d=>[d.id,d]));
 const routes=plan.routes.flatMap(r=>{
  const points=routePoints(plan,r);if(points.length<2)return [];
  const height=Number.isFinite(r.mountingHeight)?r.mountingHeight:ceiling-.25;
  const path=points.map(p=>point3d(p,height)),a=byId.get(r.from),b=byId.get(r.to);
  if(a)path.unshift(a.position);if(b)path.push(b.position);
  return [{id:r.id,kind:r.kind,points:path,wires:r.wires||[],assumed:!Number.isFinite(r.mountingHeight),circuitIds:r.circuitIds||[]}];
 });
 const rooms=plan.objects.filter(o=>o.type==='room').map(o=>({id:o.id,label:o.label,points:roomPoints(o).map(p=>point3d(p))}));
 const furnishings=[...(plan.interiors?.items||[]),...(plan.landscaping?.items||[]),...(plan.structure?.items||[]).map(i=>({...i,layer:'structure'})),...(plan.roof?.items||[]).map(i=>({...i,layer:'roof'})),...(plan.site?.items||[]).map(i=>({...i,layer:'terrain'}))].map(item=>({...item,position:point3d(item),width:item.width/100,depth:item.depth/100,height:item.height/100}));
 const extent=[...furnishings.flatMap(item=>footprint({...item,width:item.width*100,depth:item.depth*100}).map(p=>point3d(p))),...walls.flatMap(w=>[w.a,w.b]),...rooms.flatMap(r=>r.points),...devices.filter(d=>d.position).map(d=>d.position),...routes.flatMap(r=>r.points)];
 const minX=extent.length?Math.min(...extent.map(p=>p.x)):0,maxX=extent.length?Math.max(...extent.map(p=>p.x)):plan.width/100;
 const minZ=extent.length?Math.min(...extent.map(p=>p.z)):0,maxZ=extent.length?Math.max(...extent.map(p=>p.z)):plan.height/100;
 return {walls,rooms,devices,routes,furnishings,ceiling,empty:!extent.length,bounds:{minX,maxX,minZ,maxZ},unknown:devices.filter(d=>d.assumed).length};
}
