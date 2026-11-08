import React from 'react';
import {panelLayout,deviceName} from './panels.js';

const colors={A:'#d94a38',B:'#343c45',C:'#996039',N:'#269ed0',PE:'#38934d'};
export default function PanelWiringView({board,circuits,selected,onSelect}){
 const layout=panelLayout(board),width=Math.max(640,layout.slotsPerRow*44+220),height=layout.rows*235+150;
 const devices=[...layout.devices].sort((a,b)=>a.row-b.row||a.slot-b.slot);
 const xOf=d=>110+d.slot*44,yOf=d=>100+d.row*235;
 return <div className="panel-wiring"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Vista ilustrativa de montagem e fiação do quadro ${board.tag||''}`}>
 <rect x="25" y="25" width={width-50} height={height-50} rx="5" fill="#fafaf6" stroke="#6f787e" strokeWidth="2"/>
 <rect x="35" y="35" width={width-70} height={height-70} fill="none" stroke="#b2b9ba"/>
 {[0,1].map(i=><rect key={i} x="12" y={i?height-36:10} width={width-24} height="26" fill="#fff" stroke="#727d82"/>)}
 {Array.from({length:layout.rows},(_,r)=><g key={r}><text x="100" y={81+r*235} fontSize="10" fill="#7e8789">TRILHO {r+1}</text><rect x="92" y={158+r*235} width={layout.slotsPerRow*44+16} height="26" fill="#d2d7d8" stroke="#9da9ae"/><path d={`M92 ${165+r*235}h${layout.slotsPerRow*44+16}`} stroke="white"/></g>)}
 {['PE','N'].map((type,i)=><g key={type}><text x={i?width-60:44} y="88" fontSize="11" fill={colors[type]}>{type}</text><rect x={i?width-65:45} y="100" width="16" height={height-180} fill="#d5af53" stroke="#8b7337"/>{Array.from({length:Math.max(4,devices.length)},(_,n)=><g key={n}><circle cx={i?width-57:53} cy={112+n*(height-205)/Math.max(4,devices.length)} r="4" fill="#e7d18e" stroke="#766342"/><path d={`M${i?width-60:50} ${112+n*(height-205)/Math.max(4,devices.length)}h6`} stroke="#766342"/></g>)}</g>)}
 {devices.flatMap((d,index)=>{
 const associated=circuits.filter(c=>d.circuitIds.includes(c.id)),phases=[...new Set(associated.flatMap(c=>['A','B','C'].filter(p=>c.phase?.includes(p))))],x=xOf(d),y=yOf(d),w=d.modules*44;
 return phases.slice(0,d.poles).map((phase,p)=>{const px=x+(p+.5)*w/d.poles,lane=width-85-index*3-p*4;return <g key={d.id+phase} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={`M${px} ${y+140}V${y+163+p*8}H${lane}V${height-65+p*7}`} stroke="#00000015" strokeWidth="8"/><path d={`M${px} ${y+140}V${y+163+p*8}H${lane}V${height-65+p*7}`} stroke={colors[phase]} strokeWidth="4"/><text x={px} y={y+157} fill={colors[phase]} stroke="none" fontSize="9">{phase}</text></g>});
 })}
 {devices.map((d,index)=>{const x=xOf(d),y=yOf(d),w=d.modules*44,residual=['dr','idr','ddr'].includes(d.type);return <g key={d.id} role="button" tabIndex="0" aria-label={`${index+1}. ${d.label||deviceName(d)} · editar dispositivo`} aria-pressed={selected===d.id} className="wiring-device" onClick={()=>onSelect(d.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(d.id);}}}>
 <title>{d.label||deviceName(d)} · Trilho {d.row+1} / Módulo {d.slot+1}</title><rect x={x} y={y} width={w} height="140" rx="2" fill="#f2f2e9" stroke={selected===d.id?'#168e80':'#7d8786'} strokeWidth={selected===d.id?3:1.5}/>
 {Array.from({length:d.modules},(_,p)=><g key={p}><path d={`M${x+p*44} ${y}v140`} stroke="#b7bdb7"/>{[15,125].map(t=><g key={t}><circle cx={x+p*44+22} cy={y+t} r="7" fill="#cbd0ca" stroke="#6b7573"/><path d={`M${x+p*44+18} ${y+t}h8m-4 -4v8`} stroke="#596261"/></g>)}</g>)}
 <path d={`M${x} ${y+33}h${w}M${x} ${y+108}h${w}`} stroke="#e16b43" strokeWidth="3"/>
 <circle cx={x+w/2} cy={y+15} r="10" fill="white" stroke="#8c9693"/><text x={x+w/2} y={y+19} textAnchor="middle" fontSize="11" fill="#53615f">{index+1}</text>
 <text x={x+w/2} y={y+51} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4c5555">{d.type==='mcb'?(d.curve==='?'?'':d.curve)+(d.rating??'?'):d.type.toUpperCase()}</text>
 <rect x={x+6} y={y+69} width={w-12} height="23" fill="#5b625f" rx="2"/><rect x={x+8} y={y+(d.state==='off'?80:70)} width={w-16} height="11" fill={d.type==='dps'?(d.state==='off'?'#cd5649':'#39945a'):'#ef704a'} stroke="#a8593d"/>
 <text x={x+w/2} y={y+104} textAnchor="middle" fontSize="9" fill="#586260">{residual?`${d.rating??'?'}A · ${d.sensitivity??'?'}mA`:d.type==='dps'?`${d.voltage??'?'} V`:`${d.poles}P · ${d.state==='off'?'O':'I'}`}</text>
 </g>})}
 {!devices.length&&<text x={width/2} y={height/2} textAnchor="middle" fontSize="14" fill="#7b898d">Adicione dispositivos ou preencha a partir dos circuitos</text>}
 </svg><div className="wiring-color-key">{Object.entries(colors).map(([name,color])=><span key={name}><i style={{background:color}}/>{name}</span>)}</div><p className="report-note">Fiação ilustrativa das fases cadastradas. Barramentos N e PE apenas posicionais; conexões de alimentação, DR e DPS não são presumidas.</p></div>;
}
