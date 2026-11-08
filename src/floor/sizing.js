import {loadTypes,boardTypes,routeLength,validatePlan} from './model.js';
import {deviceLoadEntries,lightConfigTypes} from './deviceConfig.js';
export const sizingBasis='ABNT NBR 5410:2004 — critérios de dimensionamento, cálculo preliminar';
export const sizingSource='https://www.ipaam.am.gov.br/wp-content/uploads/2021/01/NBR-05410-05-Instala%C3%A7%C3%B5es-El%C3%A9tricas-de-baixa-Tens%C3%A3o.pdf';
export const standardSections=[1.5,2.5,4,6,10,16,25,35,50,70,95];
export const breakerRatings=[6,10,16,20,25,32,40,50,63,80,100,125];
// Numerical engineering data: Cu/PVC 70°C, table 36, columns A1/A2/B1/B2/C, 2 and 3 loaded conductors.
const ampacity=[
 [14.5,13.5,14,13,17.5,15.5,16.5,15,19.5,17.5],
 [19.5,18,18.5,17.5,24,21,23,20,27,24],
 [26,24,25,23,32,28,30,27,36,32],
 [34,31,32,29,41,36,38,34,46,41],
 [46,42,43,39,57,50,52,46,63,57],
 [61,56,57,52,76,68,69,62,85,76],
 [80,73,75,68,101,89,90,80,112,96],
 [99,89,92,83,125,110,111,99,138,119],
 [119,108,110,99,151,134,133,118,168,144],
 [151,136,139,125,192,171,168,149,213,184],
 [182,164,167,150,232,207,201,179,258,223]
];
export const installationMethods={A1:'A1 — condutores isolados em parede termicamente isolante',A2:'A2 — cabo multipolar em parede termicamente isolante',B1:'B1 — condutores isolados em eletroduto sobre/embutido em alvenaria',B2:'B2 — cabo multipolar em eletroduto sobre/embutido em alvenaria',C:'C — cabos fixados diretamente'};
export const temperatureFactors={10:1.22,15:1.17,20:1.12,25:1.06,30:1,35:.94,40:.87,45:.79,50:.71,55:.61,60:.5};
export function groupingFactor(n){if(!Number.isInteger(n)||n<1)return null;return n<=8?[1,.8,.7,.65,.6,.57,.54,.52][n-1]:n<=11?.5:n<=15?.45:n<=19?.41:.38;}
export const protectionSection=s=>s<=16?s:s<=35?16:standardSections.find(v=>v>=s/2)??null;
export const defaultSizingSettings={confirmed:false,origin:'utilityLV',method:'B1',temperature:30,groupCircuits:1,terminalDrop:4,totalDrop:5,rho:.025,reactance:.1,supplyPhase:'?',voltageLN:null,voltageLL:null,mainLength:null,mainMinimum:null,feedDrop:1,circuits:{},feeders:{},cableDiameters:{},conduits:[]};
const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
export function projectFloors(p){return p.floors?p.floors.map(f=>({id:f.id,name:f.name,elevation:f.elevation,data:f.id===p.activeFloorId?p:f.data})): [{id:'single',name:'Planta',elevation:0,data:p}];}
export function sizingInventory(project){
 const floors=projectFloors(project),circuits=new Map(),boards=[];
 for(const f of floors){for(const o of f.data.objects)if(boardTypes.includes(o.type))boards.push({...o,floorId:f.id,floorName:f.name});
  for(const c of f.data.circuits){const row=circuits.get(c.id)||{...c,panelId:c.panelId||c.remotePanel?.id||'',loads:[],floors:[],definitions:[],conflict:false};if(row.definitions.some(d=>d.voltage!==c.voltage||d.phase!==c.phase))row.conflict=true;row.definitions.push(c);row.floors.push(f.id);if(c.panelId)row.panelId=c.panelId;circuits.set(c.id,row);}
  for(const o of f.data.objects.filter(o=>loadTypes.includes(o.type)))for(const part of deviceLoadEntries(o)){const c=circuits.get(part.circuitId);if(c)c.loads.push({...part,type:o.type,floorId:f.id});}
 }
 return {floors,circuits:[...circuits.values()],boards};
}
export function sizeLine(input,settings){
 const errors=[];const {current,length,phase,minimum=2.5,dropLimit=4,groupCount=1}=input;
 if(!positive(current))errors.push('Corrente de projeto ausente ou nula.');if(!positive(length))errors.push('Informe o comprimento real até a carga mais distante, incluindo subidas e descidas.');
 if(!['A','B','C','AB','BC','CA','ABC'].includes(phase))errors.push('Fases não definidas.');if(!positive(input.voltage))errors.push('Tensão não definida.');
 const index=Object.keys(installationMethods).indexOf(settings.method),tf=temperatureFactors[settings.temperature],gf=groupingFactor(Math.max(settings.groupCircuits,groupCount));
 if(index<0||!tf||!gf)errors.push('Método, temperatura ou agrupamento fora do escopo.');
 if(!positive(settings.totalDrop)||settings.totalDrop>(settings.origin==='utilityLV'?5:7)||!['utilityLV','transformer','generator'].includes(settings.origin))errors.push('Limite total de queda de tensão inválido.');
 if(!positive(settings.rho)||!Number.isFinite(settings.reactance)||settings.reactance<0||!positive(dropLimit)||dropLimit>4)errors.push('Parâmetros de queda de tensão inválidos.');
 if(!positive(minimum)||minimum>95)errors.push('Seção mínima não definida ou fora da tabela implementada.');
 if(!settings.confirmed)errors.push('Confira e confirme as condições de instalação.');
 const breaker=breakerRatings.find(n=>n>=current);if(!breaker)errors.push('Corrente acima da série de disjuntores implementada (125 A).');
 if(input.iccKA!==undefined&&input.iccKA!==null&&!positive(input.iccKA))errors.push('Corrente de curto-circuito inválida.');
 if(input.breakingKA!==undefined&&input.breakingKA!==null&&!positive(input.breakingKA))errors.push('Capacidade de interrupção inválida.');
 if(positive(input.iccKA)&&positive(input.breakingKA)&&input.breakingKA<input.iccKA)errors.push('Capacidade de interrupção menor que a corrente de curto-circuito presumida.');
 if(input.i2t!==undefined&&input.i2t!==null&&!positive(input.i2t))errors.push('Energia passante inválida.');
 if(errors.length)return {...input,status:'pending',errors};
 const loaded=phase==='ABC'?3:2,column=index*2+(loaded===3?1:0),factor=tf*gf,thermal=positive(input.i2t)?Math.sqrt(input.i2t)/115:0;
 for(let i=0;i<standardSections.length;i++){const section=standardSections[i],iz=ampacity[i][column]*factor,impedance=Math.hypot(settings.rho/section,settings.reactance/1000),drop=(phase==='ABC'?Math.sqrt(3):2)*current*length*impedance/input.voltage*100;
  if(section>=minimum&&section>=thermal&&current<=breaker&&breaker<=iz&&1.45*breaker<=1.45*iz&&drop<=dropLimit)return {...input,status:'calculated',errors:[],section,neutralSection:section,peSection:Math.max(protectionSection(section),standardSections.find(v=>v>=thermal)||section),breaker,poles:phase.length,iz,drop,current,temperatureFactor:tf,groupFactor:gf,shortCircuitVerified:positive(input.iccKA)&&positive(input.breakingKA)&&positive(input.i2t),verified:false};
 }
 return {...input,status:'pending',errors:['Nenhuma seção até 95 mm² satisfaz simultaneamente corrente, proteção, queda de tensão e energia passante informada.']};
}
function knownRouteLength(inventory,circuit){
 const edges=new Map(),nodes=new Map();const key=(f,id)=>f+':'+id,add=(a,b,l)=>{edges.set(a,[...(edges.get(a)||[]),{to:b,length:l}]);edges.set(b,[...(edges.get(b)||[]),{to:a,length:l}]);};
 for(const f of inventory.floors){for(const o of f.data.objects)nodes.set(key(f.id,o.id),{o,f});for(const r of f.data.routes){if(!r.circuitIds.includes(circuit.id)&&!r.wires?.some(w=>w.circuitId===circuit.id))continue;const a=f.data.objects.find(o=>o.id===r.from),b=f.data.objects.find(o=>o.id===r.to);if(!Number.isFinite(r.mountingHeight)||!Number.isFinite(a?.height)||!Number.isFinite(b?.height))continue;add(key(f.id,r.from),key(f.id,r.to),routeLength(f.data,r)+Math.abs(a.height-r.mountingHeight)+Math.abs(b.height-r.mountingHeight));}}
 for(const [id,{o,f}]of nodes)if(o.peerObjectId&&o.targetFloorId){const peer=nodes.get(key(o.targetFloorId,o.peerObjectId));if(peer)add(id,key(o.targetFloorId,o.peerObjectId),Math.abs(f.elevation-peer.f.elevation));}
 const board=inventory.boards.find(b=>b.id===circuit.panelId);if(!board)return null;const distances=new Map([[key(board.floorId,board.id),0]]),visited=new Set();while(true){const next=[...distances].filter(([id])=>!visited.has(id)).sort((a,b)=>a[1]-b[1])[0];if(!next)break;const [id,d]=next;visited.add(id);for(const e of edges.get(id)||[])if(d+e.length<(distances.get(e.to)??Infinity))distances.set(e.to,d+e.length);}
 const values=circuit.loads.map(l=>distances.get(key(l.floorId,l.id)));return values.length&&values.every(Number.isFinite)?Math.max(...values):null;
}
function aggregateCurrent(rows,phase){if(!['A','AB','ABC'].includes(phase)||rows.some(r=>r.status!=='calculated'))return null;const sums={A:0,B:0,C:0};for(const row of rows)for(const p of row.phase)sums[p]+=row.current*(row.demandFactor??1);if(Object.entries(sums).some(([p,value])=>value>0&&!phase.includes(p)))return null;return Math.max(...Object.values(sums));}
export function calculateSizing(project,input={}){
 const settings={...defaultSizingSettings,...input,circuits:{...input.circuits},feeders:{...input.feeders},cableDiameters:{...input.cableDiameters},conduits:input.conduits||[]},inventory=sizingInventory(project),fingerprint=JSON.stringify(project),rows=[];
 for(const c of inventory.circuits){const opt=settings.circuits[c.id]||{},unknown=c.loads.some(l=>!Number.isFinite(l.power)),va=positive(opt.va)?opt.va:unknown?null:c.loads.reduce((s,l)=>s+l.power,0),types=new Set(c.loads.map(l=>lightConfigTypes.includes(l.type)?'lighting':'power')),kind=opt.kind||(types.size===1?[...types][0]:'mixed'),length=positive(opt.length)?opt.length:knownRouteLength(inventory,c),voltage=c.voltage,phase=c.phase,current=positive(va)&&positive(voltage)?va/(voltage*(phase==='ABC'?Math.sqrt(3):1)):null;
  const groupCount=Math.max(1,...inventory.floors.flatMap(f=>f.data.routes.filter(r=>r.circuitIds.includes(c.id)||r.wires?.some(w=>w.circuitId===c.id)).map(r=>new Set([...r.circuitIds,...(r.wires||[]).map(w=>w.circuitId).filter(Boolean)]).size)));
  let result=sizeLine({id:c.id,number:c.number,name:c.name,panelId:c.panelId,va,phase,voltage,current,length,minimum:kind==='lighting'?1.5:2.5,kind,groupCount,demandFactor:c.demandFactor??1,dropLimit:settings.terminalDrop,iccKA:opt.iccKA,breakingKA:opt.breakingKA,i2t:opt.i2t},settings);
  const problems=[];if(!['lighting','power','mixed'].includes(kind))problems.push('Classificação do circuito inválida.');if(opt.va!==undefined&&opt.va!==null&&!positive(opt.va))problems.push('Potência de projeto inválida.');if(opt.length!==undefined&&opt.length!==null&&!positive(opt.length))problems.push('Comprimento informado inválido.');if(!inventory.boards.some(b=>b.id===c.panelId))problems.push('Identifique o quadro de origem do circuito.');if(c.phase?.length===2&&inventory.floors.some(f=>f.data.routes.some(r=>r.wires?.some(w=>w.circuitId===c.id&&w.role==='neutral'))))problems.push('Duas fases com neutro exigem modelo de carregamento específico; não são tratadas como circuito fase–fase simples.');if(!c.loads.length)problems.push('Circuito sem cargas.');if(c.conflict)problems.push('O circuito tem fases ou tensão divergentes entre pavimentos.');if(!positive(va))problems.push('Complete as potências das cargas ou informe a potência de projeto em VA.');if(kind==='mixed')problems.push('Circuito misto: separe iluminação e força ou valide a classificação do projeto.');if(!positive(c.voltage)||c.phase==='?')problems.push('Complete tensão e fases na aba Circuitos.');if(c.loads.some(l=>positive(l.voltage)&&l.voltage!==c.voltage))problems.push('Há carga com tensão diferente da tensão do circuito.');
  if(problems.length)result={...result,status:'pending',errors:[...(result.errors||[]),...problems]};rows.push(result);
 }
 const mainBoard=inventory.boards.find(b=>b.type==='board'),supplyVoltage=settings.supplyPhase==='A'?settings.voltageLN:settings.voltageLL,mainCurrent=aggregateCurrent(rows,settings.supplyPhase);
 let main=sizeLine({id:'main',name:'Entrada / alimentador geral',phase:settings.supplyPhase,voltage:supplyVoltage,current:mainCurrent,length:settings.mainLength,minimum:settings.mainMinimum??null,dropLimit:settings.feedDrop,iccKA:settings.mainIccKA,breakingKA:settings.mainBreakingKA,i2t:settings.mainI2t},settings);
 const voltageConflict=rows.some(r=>positive(r.voltage)&&positive(r.phase?.length===1?settings.voltageLN:settings.voltageLL)&&Math.abs(r.voltage-(r.phase.length===1?settings.voltageLN:settings.voltageLL))>.5);if(voltageConflict)main={...main,status:'pending',errors:[...(main.errors||[]),'Tensões dos circuitos não são compatíveis com as tensões da alimentação informada.']};
 if(!mainBoard||inventory.boards.filter(b=>b.type==='board').length!==1)main={...main,status:'pending',errors:[...(main.errors||[]),'Identifique um único quadro geral no projeto.']};
 const feeders=inventory.boards.filter(b=>b.type!=='board').map(b=>{const opt=settings.feeders[b.id]||{},parent=inventory.boards.find(v=>v.id===opt.parentId),seen=new Set();let cursor=b.id,cycle=false;while(cursor){if(seen.has(cursor)){cycle=true;break;}seen.add(cursor);cursor=settings.feeders[cursor]?.parentId;}
  const descendants=new Set([b.id]);for(let i=0;i<inventory.boards.length;i++)for(const [id,v]of Object.entries(settings.feeders))if(descendants.has(v.parentId))descendants.add(id);
  const loads=rows.filter(r=>descendants.has(r.panelId)),result=sizeLine({id:b.id,name:b.tag+' · '+b.floorName,parentId:opt.parentId,phase:opt.phase||'?',voltage:opt.phase==='A'?settings.voltageLN:settings.voltageLL,current:aggregateCurrent(loads,opt.phase),length:opt.length,minimum:2.5,dropLimit:settings.feedDrop,iccKA:opt.iccKA,breakingKA:opt.breakingKA,i2t:opt.i2t},settings);
  if(!parent||cycle||parent.id===b.id||!loads.length)return {...result,status:'pending',errors:[...(result.errors||[]),'Informe o quadro de origem, sem ciclos, e complete os circuitos atendidos.']};return result;
 });
 const feederMap=new Map(feeders.map(f=>[f.id,f]));for(const row of rows){if(row.status!=='calculated')continue;let drop=main.status==='calculated'?main.drop:0,board=row.panelId,checked=main.status==='calculated',seen=new Set();while(board&&board!==mainBoard?.id){if(seen.has(board)){checked=false;break;}seen.add(board);const f=feederMap.get(board);if(f?.status!=='calculated'){checked=false;break;}drop+=f.drop;board=f.parentId;}if(!board)checked=false;row.totalDrop=checked?drop+row.drop:null;if(checked&&row.totalDrop>settings.totalDrop){row.status='pending';row.errors.push('Queda acumulada da entrada até a carga excede o limite informado. Aumente seções ou reduza os limites parciais.');}}
 const conduits=[];for(const f of inventory.floors)for(const r of f.data.routes){const pending=[],wires=r.wires||[];if(r.kind!=='conduit'){conduits.push({id:r.id,floorId:f.id,name:r.id,status:'pending',errors:['Dimensionamento de eletrocalhas requer geometria e critérios próprios.']});continue;}if(!wires.length)pending.push('Cadastre os condutores e suas quantidades neste trecho.');let area=0,count=0;for(const w of wires){const result=rows.find(c=>c.id===w.circuitId),section=result?.status==='calculated'?(w.role==='earth'?result.peSection:result.section):w.section,diameter=positive(w.outerDiameterMm)?w.outerDiameterMm:!['data','other'].includes(w.role)?settings.cableDiameters[section]:null;if(!positive(diameter))pending.push('Informe o diâmetro externo do cabo '+section+' mm² no catálogo.');else area+=Math.PI*diameter**2/4*w.quantity;count+=w.quantity;}
  const ratio=count===1?.53:count===2?.31:.4,available=(settings.conduits||[]).filter(d=>positive(d.internalDiameter)&&typeof d.name==='string'&&d.name.trim()).sort((a,b)=>a.internalDiameter-b.internalDiameter),choice=available.find(d=>area/(Math.PI*d.internalDiameter**2/4)<=ratio);if(!choice)pending.push('Nenhum diâmetro interno cadastrado comporta os cabos.');conduits.push({id:r.id,floorId:f.id,name:(f.data.objects.find(o=>o.id===r.from)?.tag||'?')+' → '+(f.data.objects.find(o=>o.id===r.to)?.tag||'?'),status:pending.length?'pending':'calculated',errors:[...new Set(pending)],choice,occupancy:choice?area/(Math.PI*choice.internalDiameter**2/4)*100:null,limit:ratio*100,notice:'Ocupação apenas. Verificar curvas, comprimento entre caixas e produto adequado (6.2.11.1).'});
 }
 return {basis:sizingBasis,source:sizingSource,settings,fingerprint,rows,feeders,main:{...main,boardId:mainBoard?.id,floorId:mainBoard?.floorId},conduits,boards:inventory.boards,verified:false,limitations:['Seccionamento automático, aterramento, DR/DPS, seletividade, influências externas e verificação final não são certificados por este cálculo.','Queda de tensão usa impedância equivalente conservadora e a corrente total no comprimento informado; confirme resistividade e reatância do cabo.','Cu/PVC 70°C; dois/três condutores carregados; agrupamento homogêneo em feixe; neutro sem redução. Trifásicos considerados equilibrados. Harmônicas relevantes, paralelismo, alumínio e instalação enterrada exigem cálculo específico.']};
}
export function applySizing(project,report){
 if(report.fingerprint!==JSON.stringify(project))throw Error('A planta mudou. Recalcule antes de aplicar.');const fresh=calculateSizing(project,report.settings);if(!fresh.settings.confirmed)throw Error('Confirme os parâmetros de cálculo.');const next=structuredClone(project),results=new Map(fresh.rows.filter(r=>r.status==='calculated').map(r=>[r.id,r]));
 for(const f of projectFloors(next)){f.data.circuits=f.data.circuits.map(c=>{const r=results.get(c.id);return r?{...c,section:r.section,breaker:r.breaker,neutralSection:r.neutralSection,peSection:r.peSection,sizing:{basis:sizingBasis,preliminary:true,length:r.length,current:r.current,drop:r.drop,shortCircuitVerified:r.shortCircuitVerified}}:c;});
  f.data.routes=f.data.routes.map(route=>{const conduit=fresh.conduits.find(c=>c.id===route.id&&c.floorId===f.id),wires=(route.wires||[]).map(w=>{const r=results.get(w.circuitId);return r&&['phase','neutral','earth','return'].includes(w.role)?{...w,section:w.role==='earth'?r.peSection:r.section}:w;});return {...route,wires,...(conduit?.status==='calculated'?{size:conduit.choice.name,sizing:{preliminary:true,internalDiameter:conduit.choice.internalDiameter,occupancy:conduit.occupancy}}:{})};});
  f.data.objects=f.data.objects.map(o=>{const feeder=fresh.feeders.find(r=>r.id===o.id&&r.status==='calculated'),layout=o.panelLayout?{...o.panelLayout,devices:o.panelLayout.devices.map(d=>{const r=d.circuitIds.length===1?results.get(d.circuitIds[0]):null;return d.type==='mcb'&&r&&r.poles===d.poles?{...d,rating:r.breaker}:d;})}:null;return {...o,...(feeder?{feederSizing:{...feeder,preliminary:true}}:{}),...(layout?{panelLayout:layout}:{})};});
  if(f.id===fresh.main.floorId&&fresh.main.status==='calculated'){f.data.mainRating=fresh.main.breaker;f.data.supply={...f.data.supply,phaseSection:fresh.main.section,neutralSection:fresh.main.neutralSection,earthSection:fresh.main.peSection,meterBreaker:fresh.main.breaker};}
 }
 next.sizingInputs=fresh.settings;next.lastSizing={basis:sizingBasis,preliminary:true,calculatedCircuits:results.size,pendingCircuits:fresh.rows.length-results.size};return validatePlan(next);
}
