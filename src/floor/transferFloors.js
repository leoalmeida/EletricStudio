import {makeObject,validatePlan,boardTypes} from './model.js';
import {withFloors,floorData,switchFloor} from './floors.js';

function splitPath(points){
 const lengths=points.slice(1).map((b,i)=>Math.hypot(b.x-points[i].x,b.y-points[i].y));const total=lengths.reduce((a,b)=>a+b,0);let walked=0;
 for(let i=0;i<lengths.length;i++){if(walked+lengths[i]>=total/2){const t=lengths[i]?(total/2-walked)/lengths[i]:.5,a=points[i],b=points[i+1],mid={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};return {mid,left:points.slice(1,i+1),right:points.slice(i+1,-1)};}walked+=lengths[i];}
 return {mid:points[0],left:[],right:[]};
}
/** Move physical objects exactly once; cut cross-floor routes into linked continuations. */
export function transferFloorObjects(project,groups){
 const p=structuredClone(withFloors(project)),sourceId=p.activeFloorId,source=floorData(p),owners=new Map(source.objects.map(o=>[o.id,sourceId])),floors=new Map(p.floors.map(f=>[f.id,{...f,data:f.id===sourceId?source:structuredClone(f.data)}]));
 for(const group of groups){if(!floors.has(group.floorId)||group.floorId===sourceId)throw Error('Pavimento de destino inválido.');for(const id of group.objectIds){if(!owners.has(id)||owners.get(id)!==sourceId)throw Error('Objeto inexistente ou transferido mais de uma vez.');owners.set(id,group.floorId);}}
 const originalObjects=new Map(source.objects.map(o=>[o.id,o]));const sourceRoutes=source.routes;source.objects=[];source.routes=[];
 for(const [id,o]of originalObjects){const dest=floors.get(owners.get(id)).data;if(dest.objects.some(v=>v.id===id))throw Error('O destino já contém esse objeto.');dest.objects.push(o);}
 const occupied=new Set([...floors.values()].flatMap(f=>f.data.objects.map(o=>o.id))),routeIds=new Set([...sourceRoutes.map(r=>r.id),...[...floors.values()].flatMap(f=>f.data.routes.map(r=>r.id))]);
 const unique=(base,set)=>{let id=base,n=1;while(set.has(id))id=base+'-'+n++;set.add(id);return id;};
 const continuations=[];
 for(const route of sourceRoutes){const fromFloor=owners.get(route.from),toFloor=owners.get(route.to);if(fromFloor===toFloor){floors.get(fromFloor).data.routes.push(route);continue;}
  const from=originalObjects.get(route.from),to=originalObjects.get(route.to),split=splitPath([{x:from.x,y:from.y},...route.points,{x:to.x,y:to.y}]);
  const linkId='continuation-'+route.id;
  const marker=(here,other,suffix)=>{const a=floors.get(here),b=floors.get(other),id=unique(linkId+'-'+suffix,occupied),type=b.elevation>a.elevation?'riserUp':'riserDown';const o=makeObject(type,split.mid.x,split.mid.y,{id,x2:split.mid.x,y2:split.mid.y,power:0,height:null,tag:'CONT-'+(continuations.length+1),label:b.name,circuitId:'',targetFloorId:other,continuationId:linkId,originalRouteId:route.id,referenceNote:'Continuação documental do percurso existente entre '+a.name+' e '+b.name+'. A divisão não acrescenta trecho físico nem define subida/descida real.'});a.data.objects.push(o);return o;};
  const a=marker(fromFloor,toFloor,'a'),b=marker(toFloor,fromFloor,'b');a.peerObjectId=b.id;b.peerObjectId=a.id;
  floors.get(fromFloor).data.routes.push({...route,to:a.id,points:split.left,continuationId:linkId,originalRouteId:route.id});
  floors.get(toFloor).data.routes.push({...structuredClone(route),id:unique(route.id+'-continuation',routeIds),from:b.id,points:split.right,continuationId:linkId,originalRouteId:route.id});
  continuations.push({id:linkId,routeId:route.id,fromFloor,toFloor});
 }
 const allCircuits=new Map(source.circuits.map(c=>[c.id,c]));
 const panels=new Map([...floors.values()].flatMap(f=>f.data.objects.filter(o=>boardTypes.includes(o.type)).map(o=>[o.id,{object:o,floor:f}])));
 for(const f of floors.values()){
  const ids=new Set(f.data.objects.map(o=>o.id)),used=new Set(f.data.objects.flatMap(o=>[o.circuitId,...(o.outlets||[]).map(part=>part.circuitId),...(o.panelLayout?.devices||[]).flatMap(d=>d.circuitIds)]).filter(Boolean));
  for(const r of f.data.routes)for(const cid of [...r.circuitIds,...(r.wires||[]).map(w=>w.circuitId)])if(cid)used.add(cid);
  for(const c of allCircuits.values())if(ids.has(c.panelId))used.add(c.id);
  const existing=new Map(f.id===sourceId?[]:f.data.circuits.map(c=>[c.id,c]));
  for(const cid of used){const raw=allCircuits.get(cid);if(!raw)continue;const c=structuredClone(raw),panel=panels.get(c.panelId);
   if(panel&&panel.floor.id!==f.id){c.remotePanel={id:c.panelId,floorId:panel.floor.id,floorName:panel.floor.name,tag:panel.object.tag,label:panel.object.label};c.panelId='';}
   if(existing.has(cid)&&JSON.stringify(existing.get(cid))!==JSON.stringify(c))throw Error('Conflito de circuito no destino.');existing.set(cid,c);
  }
  f.data.circuits=[...existing.values()];
 }
 const out={...p,...floors.get(sourceId).data,floors:[...floors.values()].map(f=>({...f,data:f.id===sourceId?null:f.data}))};
 validatePlan(out);for(const f of out.floors)validatePlan(switchFloor(out,f.id));
 return {plan:out,continuations,moved:groups.map(g=>({floorId:g.floorId,count:g.objectIds.length}))};
}
