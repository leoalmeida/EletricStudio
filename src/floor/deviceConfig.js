export const socketConfigTypes=['socket','socketLow','socketMid','socketHigh','socketFloor','socketDouble','socketTriple','socketSwitch','socketSwitchDouble','socketDoubleSwitch','socketParallelSwitch','threePhasePower','dedicated'];
export const lightConfigTypes=['light','wallLight','ledSpot','halogenLight','tubularLight','ledDriver','ledStrip'];
export const commandTypes=['switch','switch2','switch3','switchDouble','switchTriple','switchBipolar','switch2Bipolar','socketSwitch','socketSwitchDouble','socketDoubleSwitch','socketParallelSwitch'];
export const legacySocketTypes=["socketLow","socketMid","socketHigh"];
export const hasDeviceProperties=type=>[...socketConfigTypes,...lightConfigTypes,...commandTypes,"phone"].includes(type);
export const outletCount=type=>type==='socketTriple'?3:['socketDouble','socketDoubleSwitch'].includes(type)?2:1;
export const commandCount=type=>['switchDouble','socketSwitchDouble'].includes(type)?2:type==='switchTriple'?3:commandTypes.includes(type)?1:0;
export const presentation=o=>({name:socketConfigTypes.includes(o.type),power:true,circuit:true,control:true,height:false,voltage:false,...o.presentation});
export function outletParts(o){
 if(o.outlets)return o.outlets;
 const count=outletCount(o.type),cents=o.power===null?null:Math.round(o.power*100);
 return Array.from({length:count},(_,i)=>({name:i===0?o.label:'',power:cents===null?null:(Math.floor(cents/count)+(i<cents%count?1:0))/100,voltage:o.voltage??null,circuitId:o.circuitId,height:o.height,presentation:presentation(o)}));
}
export const deviceLoadEntries=o=>o.outlets?o.outlets.map((p,i)=>({...p,id:o.id,tag:o.tag,partIndex:i,partName:'Tomada '+(i+1)})):[{...o}];
export const commandsOf=o=>o.commands||Array.from({length:commandCount(o.type)},()=>({name:'',visible:true}));
export const controlledCircuits=(plan,name)=>[...new Set((plan?.objects||[]).filter(o=>lightConfigTypes.includes(o.type)&&name&&o.control===name&&o.circuitId).map(o=>o.circuitId))];
const nullable=(v,max)=>v===null||(Number.isFinite(v)&&v>=0&&v<=max);
const validPresentation=p=>p===undefined||(p&&typeof p==='object'&&!Array.isArray(p)&&Object.entries(p).every(([key,value])=>['name','power','circuit','control','height','voltage'].includes(key)&&typeof value==='boolean'));
export function validDeviceConfig(o,circuitIds){
 if(!validPresentation(o.presentation)||o.includeLegend!==undefined&&typeof o.includeLegend!=='boolean'||o.control!==undefined&&(typeof o.control!=='string'||o.control.length>40)||o.voltage!==undefined&&(!nullable(o.voltage,1000)||o.voltage===0))return false;
 if(o.commands!==undefined&&(!Array.isArray(o.commands)||o.commands.length!==commandCount(o.type)||o.commands.some(c=>!c||typeof c.name!=='string'||c.name.length>40||typeof c.visible!=='boolean')))return false;
 if(o.outlets!==undefined){
  if(!socketConfigTypes.includes(o.type)||!Array.isArray(o.outlets)||o.outlets.length!==outletCount(o.type))return false;
  for(const p of o.outlets)if(!p||typeof p.name!=='string'||p.name.length>120||!nullable(p.power,1e7)||!nullable(p.height,20)||!nullable(p.voltage,1000)||p.voltage===0||typeof p.circuitId!=='string'||p.circuitId&&!circuitIds.has(p.circuitId)||!validPresentation(p.presentation))return false;
 }
 return true;
}
export function applyDeviceProperties(o,values,plan){
 const next={...o,...values};
 if(!validDeviceConfig(next,new Set(plan.circuits.map(c=>c.id))))throw Error('Confira os valores e circuitos das cargas.');
 for(const part of deviceLoadEntries(next)){
  const c=plan.circuits.find(c=>c.id===part.circuitId);
  if(c?.voltage&&part.voltage&&c.voltage!==part.voltage)throw Error(`O circuito ${c.number} está configurado para ${c.voltage} V. Escolha um circuito com ${part.voltage} V ou ajuste sua tensão na aba Circuitos.`);
 }
 return next;
}
