import {namedWallHeight} from './floorDefaults.js';
import {blankPlan,id} from './model.js';

const keys=['width','height','mainRating','objects','routes','circuits','reference','supply'];
export const floorData=p=>Object.fromEntries(keys.map(k=>[k,p[k]===undefined?(k==='reference'||k==='mainRating'?null:k==='supply'?{}:undefined):p[k]]));
export function withFloors(p){return p.floors?p:{...p,activeFloorId:'ground',floors:[{id:'ground',name:'Térreo',elevation:0,data:null}]};}
export function switchFloor(project,nextId){
 const p=withFloors(project),target=p.floors.find(f=>f.id===nextId);
 if(!target||nextId===p.activeFloorId)return p;
 return {...p,...target.data,activeFloorId:nextId,floors:p.floors.map(f=>f.id===p.activeFloorId?{...f,data:floorData(p)}:f.id===nextId?{...f,data:null}:f)};
}
export function addFloor(project,name,copyArchitecture=false){
 const p=withFloors(project);if(p.floors.length>=30)throw Error('Limite de 30 pavimentos.');
 const fresh=blankPlan(),fid=id(),floorName=name.trim()||`${p.floors.length}º pavimento`,wallHeight=namedWallHeight(floorName);
 const objects=copyArchitecture?p.objects.filter(o=>['room','wall','door','slidingDoor','slidingDoorSingle','window','opening','stairs','corner','dimension','text'].includes(o.type)).map(o=>({...o,id:id(),circuitId:'',...(['room','wall'].includes(o.type)?{wallHeight}:{})})):[];
 const data={...floorData(fresh),width:p.width,height:p.height,objects};
 return switchFloor({...p,floors:[...p.floors,{id:fid,name:floorName,wallHeight,elevation:Math.max(...p.floors.map(f=>f.elevation))+3,data}]},fid);
}
export function deleteFloor(project,fid){
 let p=withFloors(project);if(p.floors.length===1)return p;
 if(p.activeFloorId===fid)p=switchFloor(p,p.floors.find(f=>f.id!==fid).id);
 return {...p,floors:p.floors.filter(f=>f.id!==fid)};
}
