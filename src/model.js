import {library,spec,ports,unsupportedComponents,actuated} from './catalog.js';
export {library,spec} from './catalog.js';
export function component(type,x,y,tag){const s=spec(type);if(!s)throw Error('Símbolo desconhecido.');return {id:crypto.randomUUID(),type,x,y,tag:tag||`${s.prefix}1`,label:'',pins:[...s.pins],showTag:true,showLabel:false,showPins:s.pins.map(()=>true),color:'#22c55e',delay:3,sensorWires:3,technology:'PNP',lateral:false};}
export const terminals=c=>ports(c).map(([x,y])=>({x:c.x+x,y:c.y+y}));

export function validate(p){
 if(!p||p.version!==1||typeof p.name!=='string'||!Array.isArray(p.components)||!Array.isArray(p.wires)||p.components.length>2000||p.wires.length>10000)throw Error('Arquivo de projeto inválido.');
 const ids=new Set();
 for(const c of p.components){const s=spec(c.type);
  if(!s||typeof c.id!=='string'||ids.has(c.id)||!Number.isFinite(c.x)||!Number.isFinite(c.y)||c.x<0||c.y<0||c.x>1200||c.y>900||typeof c.tag!=='string'||typeof c.label!=='string'||!Array.isArray(c.pins)||c.pins.length!==s.pins.length||c.pins.some(x=>typeof x!=='string')||!Array.isArray(c.showPins)||c.showPins.length!==s.pins.length||c.showPins.some(x=>typeof x!=='boolean')||!Number.isFinite(c.delay)||c.delay<0||c.delay>3600||![2,3].includes(c.sensorWires)||!['PNP','NPN'].includes(c.technology)||!/^#[0-9a-f]{6}$/i.test(c.color))throw Error('Componente inválido.');
  ids.add(c.id);
 }
 const wireIds=new Set();
 for(const w of p.wires){if(typeof w.id!=='string'||wireIds.has(w.id))throw Error('Identificador de conexão inválido.');wireIds.add(w.id);for(const e of [w.from,w.to]){const c=p.components.find(c=>c.id===e?.component);if(!c||!Number.isInteger(e.pin)||e.pin<0||e.pin>=terminals(c).length)throw Error('Conexão inválida.');}}
 return p;
}

export function solve(project,pressed={},previous={},elapsed={},dt=.05){
 const unsupported=unsupportedComponents(project);
 const failure=fault=>({coils:{},powered:{},live:new Set(),elapsed:{},fault});
 if(unsupported.length)return failure('Simulação indisponível para: '+unsupported.map(c=>`${c.tag} (${spec(c.type).label})`).join(', ')+'. Estes símbolos são somente desenho.');
 const key=(id,p)=>id+':'+p;
 let coils={...previous},powered={},live=new Set(),nextElapsed={...elapsed};
 for(let iteration=0;iteration<40;iteration++){
  const graph=new Map();
  const link=(a,b)=>{if(!graph.has(a))graph.set(a,[]);if(!graph.has(b))graph.set(b,[]);graph.get(a).push(b);graph.get(b).push(a);};
  project.wires.forEach(w=>link(key(w.from.component,w.from.pin),key(w.to.component,w.to.pin)));
  for(const c of project.components){const s=spec(c.type),a=actuated(c,project,pressed,coils),connect=(i,j)=>link(key(c.id,i),key(c.id,j));
   if(s.behavior==='changeover'){connect(0,a?2:1);continue;}
   if(s.behavior==='sensor'){if(a)connect(0,c.sensorWires===3?2:1);continue;}
   if(['contact','linked','thermal','assembly','passive'].includes(s.behavior)){
    const pairs=s.pairs||[[0,1]];
    if(s.shape==='ground')continue;
    pairs.forEach(([i,j],n)=>{const nc=s.normallyClosed?s.normallyClosed.includes(n):s.normal;if(nc?!a:a)connect(i,j);});
   }
  }
  function flood(behavior){const seen=new Set(),queue=project.components.filter(c=>spec(c.type).behavior===behavior).map(c=>key(c.id,0));for(const a of queue){if(seen.has(a))continue;seen.add(a);queue.push(...(graph.get(a)||[]).filter(x=>!seen.has(x)));}return seen;}
  live=flood('source');const neutral=flood('neutral');
  if([...live].some(n=>neutral.has(n)))return failure('Curto-circuito: fase e neutro conectados sem carga.');
  const next={};powered={};
  for(const c of project.components){const s=spec(c.type);
   if(!['load','coil','ton','tof','assembly'].includes(s.behavior))continue;
   const a=key(c.id,0),b=key(c.id,1),on=(live.has(a)&&neutral.has(b))||(live.has(b)&&neutral.has(a));
   powered[c.id]=on;
   if(['coil','assembly'].includes(s.behavior))next[c.tag]=!!next[c.tag]||on;
   if(s.behavior==='ton'){nextElapsed[c.id]=on?(elapsed[c.id]||0)+dt:0;next[c.tag]=!!next[c.tag]||(on&&nextElapsed[c.id]>=c.delay);}
   if(s.behavior==='tof'){
    const armedKey=c.id+':armed',armed=!!elapsed[armedKey];
    nextElapsed[c.id]=on?0:armed?(elapsed[c.id]||0)+dt:0;
    const output=on||(armed&&nextElapsed[c.id]<c.delay);
    nextElapsed[armedKey]=on||output;
    next[c.tag]=!!next[c.tag]||output;
   }
  }
  const equal=Object.keys(next).length===Object.keys(coils).length&&Object.entries(next).every(([k,v])=>coils[k]===v);
  coils=next;
  if(equal)return {coils,powered,live,elapsed:nextElapsed,fault:null};
 }
 return failure('Lógica oscilante: verifique contatos e bobinas com a mesma TAG.');
}

export function example(){let cs=[component('source',240,60,'L'),component('nc',240,140,'S0'),component('no',240,260,'S1'),component('contact',400,260,'K1'),component('overload',240,380,'F1'),component('coil',240,500,'K1'),component('neutral',240,620,'N'),component('lamp',560,500,'H1'),component('source',760,60,'L'),component('contact',760,260,'K1'),component('motor',760,500,'M1'),component('neutral',760,620,'N')];cs[1].label='Parada';cs[2].label='Partida';cs[4].label='Proteção térmica';cs.forEach(c=>c.showLabel=!!c.label);let w=[];let add=(a,p,b,q)=>w.push({id:crypto.randomUUID(),from:{component:cs[a].id,pin:p},to:{component:cs[b].id,pin:q}});add(0,0,1,0);add(1,1,2,0);add(1,1,3,0);add(2,1,4,0);add(3,1,4,0);add(4,1,5,0);add(5,1,6,0);add(4,1,7,0);add(7,1,6,0);add(8,0,9,0);add(9,1,10,0);add(10,1,11,0);return {version:1,name:'Partida direta com selo',components:cs,wires:w};}
