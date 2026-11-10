import {switchFloor,withFloors} from './floors.js';
import {footprint} from './layoutModel.js';
import {wallSegments,roomPoints,roomArea,roomLabelPoint} from './architecture.js';
import {wallScene} from './wallScene.js';
import {nodeTypes,boardTypes,lightingTypes,routePoints} from './model.js';
import {outletParts,socketConfigTypes} from './deviceConfig.js';

// Coordinates in the document are centimetres; the 3D scene uses metres, Y up.
export const point3d=(p,height=0)=>({x:p.x/100,y:height,z:p.y/100});
export function buildPlanScene(plan,{defaults=false,architecturalOnly=false}={}){
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
 const devices=plan.objects.filter(o=>!architecturalOnly&&nodeTypes.includes(o.type)).flatMap(o=>{
  const parts=socketConfigTypes.includes(o.type)?outletParts(o):[o];
  return parts.map((part,index)=>{
   const assumed=!Number.isFinite(part.height),preset=boardTypes.includes(o.type)?1.5:o.type==='wallLight'?2:o.type.startsWith('switch')?1.2:lightingTypes.includes(o.type)?ceiling-.1:.3;
   return {id:o.id,key:o.id+'-'+index,type:o.type,tag:o.tag,rotation:o.rotation||0,circuitId:part.circuitId||o.circuitId,assumed,
    position:assumed&&!defaults?null:point3d({x:o.x+index*12*Math.cos((o.rotation||0)*Math.PI/180),y:o.y+index*12*Math.sin((o.rotation||0)*Math.PI/180)},assumed?preset:part.height)};
  });
 });
 const byId=new Map(devices.filter(d=>d.position).map(d=>[d.id,d]));
 const routes=(architecturalOnly?[]:plan.routes).flatMap(r=>{
  const points=routePoints(plan,r);if(points.length<2)return [];
  const height=Number.isFinite(r.mountingHeight)?r.mountingHeight:ceiling-.25;
  const path=points.map(p=>point3d(p,height)),a=byId.get(r.from),b=byId.get(r.to);
  if(a)path.unshift(a.position);if(b)path.push(b.position);
  return [{id:r.id,kind:r.kind,points:path,wires:r.wires||[],assumed:!Number.isFinite(r.mountingHeight),circuitIds:r.circuitIds||[]}];
 });
 const rooms=plan.objects.filter(o=>o.type==='room').map(o=>({id:o.id,label:o.showName===false?'':o.label,area:roomArea(o),height:o.wallHeight||2.8,labelPosition:point3d(roomLabelPoint(o),.06),points:roomPoints(o).map(p=>point3d(p))}));
 const furnishings=[...(plan.interiors?.items||[]),...(plan.landscaping?.items||[]),...(plan.structure?.items||[]).map(i=>({...i,layer:'structure'})),...(plan.roof?.items||[]).map(i=>({...i,layer:'roof'})),...(plan.site?.items||[]).map(i=>({...i,layer:'terrain'}))].filter(item=>!architecturalOnly||item.layer==='roof').map(item=>({...item,position:point3d(item),width:item.width/100,depth:item.depth/100,height:item.height/100}));
 const extent=[...furnishings.flatMap(item=>footprint({...item,width:item.width*100,depth:item.depth*100}).map(p=>point3d(p))),...walls.flatMap(w=>[w.a,w.b]),...rooms.flatMap(r=>r.points),...devices.filter(d=>d.position).map(d=>d.position),...routes.flatMap(r=>r.points)];
 const heights=[0,...walls.map(w=>w.height),...devices.filter(d=>d.position).map(d=>d.position.y),...routes.flatMap(r=>r.points.map(p=>p.y)),...furnishings.flatMap(i=>[(i.elevation||0)/100,(i.elevation||0)/100+(i.type==='roofPlane'?i.depth*(i.slope||0)/100+.08:i.height)])];
 const minX=extent.length?Math.min(...extent.map(p=>p.x)):0,maxX=extent.length?Math.max(...extent.map(p=>p.x)):plan.width/100;
 const minZ=extent.length?Math.min(...extent.map(p=>p.z)):0,maxZ=extent.length?Math.max(...extent.map(p=>p.z)):plan.height/100;
 return {walls,rooms,devices,routes,furnishings,ceiling,empty:!extent.length,bounds:{minX,maxX,minZ,maxZ,minY:Math.min(...heights),maxY:Math.max(...heights)},unknown:devices.filter(d=>d.assumed).length};
}


// Floor elevations are metres; item elevations remain local centimetres.
// Always read the active floor from the live document, never its null data slot.
export function buildBuildingScene(project,{separation=0,...options}={}){
 const plan=withFloors(project),gap=Number.isFinite(separation)?Math.max(0,Math.min(5,separation)):0;
 const floors=[...plan.floors].sort((a,b)=>a.elevation-b.elevation);
 const result={walls:[],rooms:[],devices:[],routes:[],furnishings:[],levels:[],unknown:0,empty:true,ceiling:0};
 const bounds=[];
 floors.forEach((floor,index)=>{
  const current=switchFloor(plan,floor.id),scene=buildPlanScene(current,options),offset=floor.elevation+index*gap;
  const position=p=>({...p,y:p.y+offset}),identify=item=>({...item,id:floor.id+':'+item.id,floorId:floor.id});
  result.levels.push({id:floor.id,name:floor.name,elevation:floor.elevation,displayElevation:offset,rooms:scene.rooms.length});
  result.walls.push(...scene.walls.map(w=>({...identify(w),a:position(w.a),b:position(w.b)})));
  result.rooms.push(...scene.rooms.map(r=>({...identify(r),floorName:floor.name,points:r.points.map(position),labelPosition:position(r.labelPosition)})));
  result.devices.push(...scene.devices.map(d=>({...identify(d),key:floor.id+':'+d.key,position:d.position?position(d.position):null})));
  result.routes.push(...scene.routes.map(r=>({...identify(r),points:r.points.map(position)})));
  // Site geometry is global and must appear once at its real elevation.
  result.furnishings.push(...scene.furnishings.filter(i=>i.layer!=='terrain'||index===0).map(i=>({...identify(i),baseElevation:i.layer==='terrain'?0:offset})));
  result.unknown+=scene.unknown;
  if(!scene.empty){result.empty=false;bounds.push({...scene.bounds,minY:scene.bounds.minY+offset,maxY:scene.bounds.maxY+offset});}
 });
 result.bounds=bounds.length?{minX:Math.min(...bounds.map(b=>b.minX)),maxX:Math.max(...bounds.map(b=>b.maxX)),minZ:Math.min(...bounds.map(b=>b.minZ)),maxZ:Math.max(...bounds.map(b=>b.maxZ)),minY:Math.min(...bounds.map(b=>b.minY)),maxY:Math.max(...bounds.map(b=>b.maxY))}:{minX:0,maxX:plan.width/100,minZ:0,maxZ:plan.height/100,minY:0,maxY:2.8};
 result.ceiling=result.bounds.maxY;
 return result;
}
