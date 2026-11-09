import {emptyFinishes} from './finishesModel.js';
import {emptyLayout} from './layoutModel.js';
import {emptyHydraulics} from './hydraulicModel.js';
import {namedWallHeight} from './floorDefaults.js';
import {blankPlan,id} from './model.js';

const keys=['width','height','mainRating','objects','routes','circuits','reference','supply','hydraulics','interiors','landscaping','structure','roof','hvac','systems','finishes'];
export const floorData=p=>Object.fromEntries(keys.map(k=>[k,p[k]===undefined?(k==='reference'||k==='mainRating'?null:k==='supply'?{}:['hydraulics','hvac','systems'].includes(k)?emptyHydraulics():k==='finishes'?emptyFinishes():['interiors','landscaping','structure','roof'].includes(k)?emptyLayout():undefined):p[k]]));
export function withFloors(p){return p.floors?p:{...p,activeFloorId:'ground',floors:[{id:'ground',name:'Térreo',elevation:0,data:null}]};}
export function switchFloor(project,nextId){
 const p=withFloors(project),target=p.floors.find(f=>f.id===nextId);
 if(!target||nextId===p.activeFloorId)return p;
 return {...p,...target.data,hvac:target.data?.hvac||emptyHydraulics(),systems:target.data?.systems||emptyHydraulics(),finishes:target.data?.finishes||emptyFinishes(),structure:target.data?.structure||emptyLayout(),roof:target.data?.roof||emptyLayout(),interiors:target.data?.interiors||emptyLayout(),landscaping:target.data?.landscaping||emptyLayout(),hydraulics:target.data?.hydraulics||emptyHydraulics(),activeFloorId:nextId,floors:p.floors.map(f=>f.id===p.activeFloorId?{...f,data:floorData(p)}:f.id===nextId?{...f,data:null}:f)};
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

export function moveFloor(project,floorId,direction){const p=withFloors(project),index=p.floors.findIndex(f=>f.id===floorId),target=index+direction;if(![-1,1].includes(direction)||index<0||target<0||target>=p.floors.length)return project;const floors=[...p.floors];[floors[index],floors[target]]=[floors[target],floors[index]];return {...p,floors};}
