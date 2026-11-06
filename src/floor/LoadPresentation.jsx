import React from 'react';
import {loadOverview,formatLoad as fmt} from './loadOverview.js';

export function SupplyTable({plan}){
 const supply=plan.supply||{},data=loadOverview(plan);
 return <><div className="load-supply-caption"><span>Concessionária: <strong>{supply.utility||'Não informada'}</strong></span><span>Nível de tensão: <strong>{supply.voltageLabel||'A confirmar'}</strong></span></div><table className="load-supply-table"><thead><tr>{['Fases','Seção fase (mm²)','Seção neutro (mm²)','Disjuntor medidor (A)','Seção terra (mm²)','Disjuntor geral (A)','Potência instalada (kVA)','Potência demandada (kVA)'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody><tr>{[supply.phases,supply.phaseSection,supply.neutralSection,supply.meterBreaker,supply.earthSection,plan.mainRating,data.installedVA===null?null:data.installedVA/1000,data.demandVA===null?null:data.demandVA/1000].map((v,i)=><td key={i}>{fmt(v,i===0?0:2)}</td>)}</tr></tbody></table></>;
}
export function PhaseSummary({data}){
 return <section className="load-phase-summary"><h3>Corrente demandada (A) por fase</h3><table><thead><tr><th scope="col">Total</th>{['A','B','C'].map(p=><th key={p} scope="col">{p}</th>)}</tr></thead><tbody><tr><th scope="row">Corrente</th>{['A','B','C'].map(p=><td key={p}>{fmt(data.phases[p].current)}</td>)}</tr></tbody></table>{data.unassigned>0&&<p className="floor-warning">{data.unassigned} circuito(s) sem fase definida, fora dos totais por fase.</p>}{data.unknownPoints>0&&<p className="report-note">{data.unknownPoints} ponto(s) com potência a confirmar. Total conhecido: {fmt(data.knownVA,0)} VA.</p>}</section>;
}
