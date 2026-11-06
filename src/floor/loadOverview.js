import {loadSchedule} from './model.js';

export const formatLoad=(n,d=2)=>n===null||n===undefined||!Number.isFinite(n)?'A confirmar':n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
export function loadOverview(plan,panelId=''){
 const rows=loadSchedule(plan).filter(c=>!panelId||c.panelId===panelId).map(c=>{
  const factor=c.demandFactor??1,demandVA=c.va===null?null:c.va*factor,demandCurrent=c.current===null?null:c.current*factor;
  return {...c,demandFactor:factor,demandVA,demandCurrent};
 });
 const phases=Object.fromEntries(['A','B','C'].map(phase=>{
  const circuits=rows.filter(c=>c.phase.includes(phase)),unknown=circuits.filter(c=>c.demandCurrent===null).length;
  return [phase,{current:unknown?null:circuits.reduce((sum,c)=>sum+c.demandCurrent,0),unknown,circuits:circuits.length}];
 }));
 const unknownPoints=rows.reduce((s,c)=>s+c.unknownPoints,0),knownVA=rows.reduce((s,c)=>s+c.knownVA,0),knownDemandVA=rows.reduce((s,c)=>s+c.knownVA*c.demandFactor,0);
 return {rows,phases,unknownPoints,knownVA,knownDemandVA,installedVA:unknownPoints?null:knownVA,demandVA:unknownPoints?null:knownDemandVA,unassigned:rows.filter(c=>c.phase==='?').length};
}
export function loadWorkbookRows(plan,panelId=''){
 const data=loadOverview(plan,panelId),s=plan.supply||{},active=plan.floors?.find(f=>f.id===plan.activeFloorId)?.name||'Térreo';
 const value=n=>n??'A confirmar';
 return [
  ['Quadro de cargas',plan.name],['Pavimento',active],['Concessionária',s.utility||'Não informada'],['Nível de tensão',s.voltageLabel||'Não informado'],[],
  ['Ramal de entrada'],['Fases','Seção fase (mm²)','Seção neutro (mm²)','Disjuntor medidor (A)','Seção terra (mm²)','Disjuntor geral (A)'],
  [value(s.phases),value(s.phaseSection),value(s.neutralSection),value(s.meterBreaker),value(s.earthSection),value(plan.mainRating)],[],
  ['Circuito','Quadro','Descrição','Seção (mm²)','Disjuntor (A)','Tensão (V)','Fases','Pontos','Potência (VA)','Fator de demanda (%)','Demanda (VA)','Ib (A)','Id (A)'],
  ...data.rows.map(c=>[c.number,c.panel,c.name,value(c.section),value(c.breaker),value(c.voltage),c.phase,c.points,value(c.va),c.demandFactor*100,value(c.demandVA),value(c.current),value(c.demandCurrent)]),[],
  ['Potência instalada (VA)',value(data.installedVA)],['Potência demandada (VA)',value(data.demandVA)],[],
  ['Corrente demandada por fase (A)','A','B','C'],['Total',...['A','B','C'].map(k=>value(data.phases[k].current))],
  ['Circuitos sem fase definida',data.unassigned],['Pontos com potência desconhecida',data.unknownPoints],[],
  ['Cálculo','Ib = VA/V; ABC equilibrado = VA/(√3·V). Id = Ib × fator de demanda informado.'],
  ['Observação','Fatores e seções informados pelo projetista. Sem seleção automática normativa de cabos ou proteções. Não inclui outros pavimentos.']
 ];
}
