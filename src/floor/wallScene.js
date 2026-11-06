import {projectToWall,openingTypes} from './architecture.js';
import {nodeTypes,boardTypes} from './model.js';
import {outletParts,socketConfigTypes} from './deviceConfig.js';
export function makeWallSection(a,b){
 const horizontal=Math.abs(b.x-a.x)>=Math.abs(b.y-a.y),length=horizontal?Math.abs(b.x-a.x):Math.abs(b.y-a.y);if(length<30)throw Error('Marque uma faixa de pelo menos 30 cm.');
 return {id:'wall-section',type:'sectionView',label:'Corte da planta',x:horizontal?Math.min(a.x,b.x):(a.x+b.x)/2,y:horizontal?(a.y+b.y)/2:Math.min(a.y,b.y),x2:horizontal?Math.max(a.x,b.x):(a.x+b.x)/2,y2:horizontal?(a.y+b.y)/2:Math.max(a.y,b.y),width:12,wallHeight:2.8,bandDepth:Math.max(40,horizontal?Math.abs(b.y-a.y):Math.abs(b.x-a.x))};
}
export function wallScene(plan,wall,{bandDepth,defaults=false}={}){
 const length=Math.hypot(wall.b.x-wall.a.x,wall.b.y-wall.a.y),height=wall.height*100,tolerance=bandDepth===undefined?24+wall.width/2+2:bandDepth/2+2;
 const projected=plan.objects.filter(o=>nodeTypes.includes(o.type)||openingTypes.includes(o.type)).map(o=>({o,p:projectToWall(o,wall)})).filter(v=>v.p&&v.p.distance<=tolerance&&v.p.t>=0&&v.p.t<=1);
 const devices=projected.filter(v=>nodeTypes.includes(v.o.type)).flatMap(({o,p})=>{
  const parts=o.outlets&&socketConfigTypes.includes(o.type)?outletParts(o):[o];
  return parts.map((part,i)=>{const known=Number.isFinite(part.height),preset=boardTypes.includes(o.type)?1.5:o.type==='wallLight'?2:o.type.startsWith('switch')?1.2:['light','ledSpot','halogenLight','tubularLight','ledDriver','ledStrip'].includes(o.type)?wall.height-.1:.3;
   return {o,p,index:i,key:o.id+'-'+i,x:p.t*length+(i-(parts.length-1)/2)*15,height:known?part.height*100:defaults?preset*100:null,assumed:!known&&defaults,part};});
 });
 const openings=projected.filter(v=>openingTypes.includes(v.o.type)).flatMap(({o})=>{const r=(o.rotation||0)*Math.PI/180,end={x:o.x-Math.sin(r)*o.width,y:o.y+Math.cos(r)*o.width},a=projectToWall(o,wall),b=projectToWall(end,wall);if(!a||!b||Math.abs(b.t-a.t)*length<o.width*.7)return [];const x=Math.max(0,Math.min(a.t,b.t)*length),right=Math.min(length,Math.max(a.t,b.t)*length);return right>x?[{o,x,width:right-x}]:[];});
 return {length,height,devices,openings};
}
