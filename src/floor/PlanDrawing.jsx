import React,{useId} from 'react';
import RouteDimensions from './RouteDimensions.jsx';
import OpeningDrawing from './OpeningDrawing.jsx';
import {openingTypes,roomPath,roomLabelPoint,roomWallPath} from './architecture.js';
import SocketSymbol from './SocketSymbol.jsx';
import SwitchSymbol from './SwitchSymbol.jsx';
import DeviceAnnotations from './DeviceAnnotations.jsx';
import {hasDeviceProperties} from './deviceConfig.js';
import StairDrawing from './StairDrawing.jsx';
import {WORLD,nodeTypes,routePoints,nameOf,switchTypes} from './model.js';
import {parallelPath,wireAnnotation} from './conductors.js';
export function PointSymbol({type,object}){
 const arrow=<path d="M-11 10L0 -12L11 10Z"/>;
 let content;
 if(type==='light')content=<><circle r="18" fill="white"/><path d="M-18 0H18M0 0V18" strokeWidth="1"/></>;
 else if(type==='ledSpot')content=<><rect x="-14" y="-14" width="28" height="28"/><circle r="10"/><circle r="3" fill="currentColor"/></>;
 else if(type==='halogenLight')content=<><circle r="12"/><path d="M-5 -6V6M5 -6V6M-5 0H5M-3 12V17H3V12"/></>;
 else if(type==='tubularLight')content=<><rect x="-22" y="-5" width="44" height="10"/><path d="M-18 -5V5M18 -5V5M-24 -3H-22M-24 3H-22M22 -3H24M22 3H24"/></>;
 else if(type==='ledDriver')content=<><rect x="-20" y="-11" width="40" height="22" rx="2"/><path d="M-25 -5H-20M-25 5H-20M20 -5H25M20 5H25M-5 6H8M-5 9H0M3 9H8"/><text x="0" y="1" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">LED</text></>;
 else if(type==='ledStrip')content=<><rect x="-24" y="-5" width="48" height="10"/>{[-15,0,15].map(x=><g key={x}><rect x={x-3} y="-2" width="6" height="4" fill="#e7cf6a" strokeWidth="1"/></g>)}<path d="M-27 -3H-24M24 3H27"/></>;
 else if(type==='wallLight')content=<><path d="M-11 0A11 11 0 0 1 11 0Z" fill="white"/><path d="M0 0V24"/></>;
 else if(type.startsWith('socket')||type==='threePhasePower'||type==='dedicated')content=<SocketSymbol type={type} object={object}/>;
 else if(type==='dedicated')content=<>{arrow}{type==='socketMid'&&<path d="M-7 3H7L0 10Z" fill="currentColor"/>}{['socketHigh','dedicated'].includes(type)&&<path d="M-11 10L0 -12L11 10Z" fill="currentColor"/>}{type==='socketDouble'&&<path d="M-11 21L0 -1L11 21Z"/>}</>;
 else if(switchTypes.includes(type))content=<SwitchSymbol type={type}/>;
 else if(type==='bellPush')content=<><circle r="9" fill="white"/><circle r="3" fill="currentColor"/><path d="M0 9V24"/></>;
 else if(type==='camera')content=<><g transform="rotate(-15)"><path d="M-20 -11H10L17 -5V7H-20Z" fill="white"/><path d="M-20 -8H9M10 -11V7" strokeWidth="1"/><ellipse cx="16" cy="0" rx="3" ry="6" fill="#dbe8eb"/><circle cx="16" cy="0" r="1" fill="currentColor"/></g><path d="M-3 9V17H5V24H10V14H3V9"/></>;
 else if(['phone','data'].includes(type))content=<><path d="M-12 -9H12L0 12Z"/>{type==='data'?<path d="M-6 -4H6L0 4Z"/>:<path d="M-5 -3Q0 5 5 -3"/>}</>;
 else if(['board','subBoard'].includes(type))content=<><rect x="-13" y="-17" width="26" height="34" fill="white"/><path d="M-13 -17L13 17H-13Z" fill={type==='board'?'currentColor':'#c9d5df'}/></>;
 else if(type==='mainBreaker')content=<><rect x="-14" y="-17" width="28" height="34" fill="white"/><path d="M0 -24V-10M0 24V10M0 10L-8 -9M-5 -10H5"/></>;
 else if(type==='junction')content=<><rect x="-10" y="-10" width="20" height="20" fill="white"/><path d="M-8 -8L8 8M-8 8L8 -8"/></>;
 else if(type==='meter')content=<><circle r="17" fill="white"/><rect x="-10" y="-9" width="20" height="9"/><text y="11" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">kWh</text></>;
 else if(['riserUp','riserDown'].includes(type))content=<><path d="M0 -24V24" stroke="#25a68f" strokeWidth="2.5"/><path d="M-8 -6L2 -10L11 -5V8L2 12L-8 7Z M-8 -6L2 -1L11 -5 M2 -1V12" fill="white" stroke="currentColor"/>{type==='riserUp'?<path d="M-17 19V-19M-22 -12L-17 -21L-12 -12Z" stroke="#d46b61"/>:<path d="M-17 -19V19M-22 12L-17 21L-12 12Z" stroke="#d46b61"/>}</>;
 else if(type==='bell')content=<><path d="M-11 5V-1A11 11 0 0 1 11 -1V5ZM-15 5H15M-4 10Q0 15 4 10"/></>;
 return <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">{content}</g>;
}

export function PlanObject({o,selected=false,showLabels=true,gridVisible=false,levelName='',plan,onDown,onDouble}){
 const dx=o.x2-o.x,dy=o.y2-o.y,isLine=['wall','dimension'].includes(o.type),isRoom=o.type==='room',roomLabel=isRoom?roomLabelPoint(o):null;
 return <g className="plan-object" onPointerDown={onDown?e=>onDown(e,o):undefined} onDoubleClick={onDouble?e=>{e.stopPropagation();onDouble(o);}:undefined} style={{color:selected?'#246cc2':['phone','data','camera'].includes(o.type)?'#707b8e':'#293c4a'}}>
 {isRoom?<><path d={roomPath(o)} fill={gridVisible?'transparent':o.openArea?'white':'#fafbf9'} stroke="none"/><path d={roomWallPath(o)} fill="none" stroke={selected?'#347acd':'#7b8587'} strokeWidth={o.width} strokeDasharray={o.openArea?'15 10':undefined}/><path d={roomWallPath(o)} fill="none" stroke="white" strokeWidth={Math.max(1,o.width-3)}/>{o.showName!==false&&<text x={roomLabel.x} y={roomLabel.y} textAnchor="middle" fill="#7c878d" fontSize="15">{o.label}</text>}</>:isLine?<>
 <path d={`M${o.x} ${o.y}L${o.x2} ${o.y2}`} fill="none" stroke="transparent" strokeWidth="20"/>
 {o.type==='wall'?<><path d={`M${o.x} ${o.y}L${o.x2} ${o.y2}`} stroke={selected?'#347acd':'#7b8587'} strokeWidth={o.width}/><path d={`M${o.x} ${o.y}L${o.x2} ${o.y2}`} stroke="white" strokeWidth={Math.max(1,o.width-3)}/></>:<g fill="none" stroke="currentColor" strokeWidth="1"><path d={`M${o.x} ${o.y}L${o.x2} ${o.y2}M${o.x-5} ${o.y-7}l10 14M${o.x2-5} ${o.y2-7}l10 14`}/><text x={(o.x+o.x2)/2} y={(o.y+o.y2)/2-9} textAnchor="middle" fill="currentColor" stroke="none" fontSize="13">{(Math.hypot(dx,dy)/100).toFixed(2)} m</text></g>}
 </>:<g transform={`translate(${o.x} ${o.y}) rotate(${o.rotation})`}>
 {openingTypes.includes(o.type)?<OpeningDrawing o={o}/>:o.type==='stairs'?<StairDrawing o={o}/>:o.type==='corner'?<path d={`M0 ${o.width}V0H${o.width}`} stroke="currentColor" strokeWidth="12" fill="none"/>:o.type==='text'?<text fontSize="16" fill="currentColor">{o.label}</text>:<><circle r="22" fill={selected?'#e5efff':'transparent'} stroke={selected?'#6e9fe0':'none'} strokeDasharray="3 3"/><PointSymbol type={o.type} object={o}/></>}
 </g>}
 {showLabels&&hasDeviceProperties(o.type)&&<DeviceAnnotations o={o} plan={plan}/>}
 {showLabels&&!hasDeviceProperties(o.type)&&nodeTypes.includes(o.type)&&<g fontSize="10" fill={selected?'#246cc2':'#586e7e'}><text x={o.x+20} y={o.y-6}>{o.tag}</text><text x={o.x+20} y={o.y+9}>{o.label|| (o.power?o.power+' VA':'')}</text>{['junction','board','subBoard'].includes(o.type)&&o.presentation?.height&&<text x={o.x+20} y={o.y+23}>{Number.isFinite(o.height)?'h='+o.height.toLocaleString('pt-BR',{maximumFractionDigits:2})+' m':'h: a confirmar'}</text>}{['riserUp','riserDown'].includes(o.type)&&<text x={o.x+20} y={o.y+23} fill="#319783">{o.type==='riserUp'?'Sobe':'Desce'} → {levelName||'A definir'}</text>}</g>}
 </g>;
}
export default function PlanDrawing({plan,selected,selectedIds=[],onObjectDown,onObjectDouble,onRouteDown,onRouteDouble,onWireDouble,showGrid=false,gridZoom=1,showLabels=true,showRoutes=true,showWires=true,showRouteSizes=true,showRouteLengths=false,showDimensions=true,showNodes=true,highlight='',showArchitecture=true}){
 const gridId=useId().replaceAll(':',''),minorGrid=gridId+'-minor',majorGrid=gridId+'-major',gridStep=gridZoom<.25?50:gridZoom<.6?20:10;
 const architecture=plan.objects.filter(o=>!nodeTypes.includes(o.type)),nodes=plan.objects.filter(o=>nodeTypes.includes(o.type));
 const object=o=><PlanObject key={o.id} o={o} plan={plan} selected={o.id===selected||selectedIds.includes(o.id)} showLabels={showLabels} gridVisible={showGrid} levelName={plan.floors?.find(f=>f.id===o.targetFloorId)?.name||(o.targetFloorId?'Destino removido':'')} onDown={onObjectDown} onDouble={onObjectDouble}/>;
 return <>
 {showGrid&&<g pointerEvents="none" aria-hidden="true"><defs><pattern id={minorGrid} width={gridStep} height={gridStep} patternUnits="userSpaceOnUse"><path d={`M${gridStep} 0H0V${gridStep}`} fill="none" stroke="#ccd5de" strokeWidth={.6/gridZoom}/></pattern><pattern id={majorGrid} width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill={`url(#${minorGrid})`}/><path d="M100 0H0V100" fill="none" stroke="#aebdca" strokeWidth={.9/gridZoom}/></pattern></defs><rect width={plan.width} height={plan.height} fill={`url(#${majorGrid})`}/></g>}
 {showArchitecture&&[...architecture].sort((a,b)=>(openingTypes.includes(a.type)?1:0)-(openingTypes.includes(b.type)?1:0)).filter(o=>showDimensions||o.type!=='dimension').map(object)}
 {(showRoutes||showWires||showRouteLengths)&&plan.routes.map(r=>{const pts=routePoints(plan,r);if(pts.length<2)return null;const d=pts.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' '),c=plan.circuits.find(c=>r.circuitIds.includes(c.id)),color=r.id===selected?'#2371d0':highlight&&r.circuitIds.includes(highlight)?'#e58024':c?.color||'#687987';const longest=pts.slice(1).map((b,i)=>({a:pts[i],b,length:Math.hypot(b.x-pts[i].x,b.y-pts[i].y)})).sort((a,b)=>b.length-a.length)[0],mid={x:(longest.a.x+longest.b.x)/2,y:(longest.a.y+longest.b.y)/2},wires=r.wires||[];return <g key={r.id} opacity={highlight&&r.circuitIds.length&&!r.circuitIds.includes(highlight)?.2:1} onPointerDown={onRouteDown?e=>onRouteDown(e,r):undefined} onDoubleClick={onRouteDouble?e=>{e.stopPropagation();onRouteDouble(r);}:undefined}>{showRoutes&&<path d={d} stroke="transparent" strokeWidth="16" fill="none"/>}{showRoutes&&(r.kind==='tray'||(showWires&&wires.length>0))&&<path d={d} stroke="#b0b9c1" strokeWidth={Math.max(10,Math.min(wires.length,8)*2.5+4)} fill="none"/>}{showRoutes&&<path d={d} stroke={color} strokeWidth={r.kind==='tray'?4:1.8} fill="none" strokeDasharray={r.kind==='tray'?'8 4':undefined}/>}{showWires&&wires.slice(0,8).map((w,i)=>{const line=parallelPath(pts,(i-(Math.min(wires.length,8)-1)/2)*2.5).map((p,j)=>`${j?'L':'M'}${p.x} ${p.y}`).join(' ');return <g key={w.id} onDoubleClick={onWireDouble?e=>{e.stopPropagation();onWireDouble(r,w);}:undefined}><title>{wireAnnotation(w)+' · '+w.color+(w.stripeColor?' / '+w.stripeColor:'')}</title>{onWireDouble&&<path d={line} stroke="transparent" strokeWidth="6" fill="none"/>}<path d={line} stroke={w.color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>{w.stripeColor&&<path d={line} stroke={w.stripeColor} strokeWidth="1.8" fill="none" strokeDasharray="4 4" strokeLinejoin="round"/>}</g>;})}{showLabels&&showWires&&longest.length>=120&&wires.slice(0,4).map((w,i)=><g key={'label'+w.id} pointerEvents="none"><path d={`M${mid.x+8} ${mid.y+8+i*11}h13`} stroke={w.color} strokeWidth="3"/>{w.stripeColor&&<path d={`M${mid.x+8} ${mid.y+8+i*11}h13`} stroke={w.stripeColor} strokeWidth="3" strokeDasharray="3 3"/>}<text x={mid.x+25} y={mid.y+11+i*11} fontSize="8" fill="#435d6e" stroke="white" strokeWidth="2" paintOrder="stroke">{wireAnnotation(w)}</text></g>)}{showLabels&&showWires&&wires.length>4&&<text x={mid.x+8} y={mid.y+56} fontSize="8" fill="#435d6e">+{wires.length-4} tipos de fios</text>}{showRoutes&&showLabels&&showRouteSizes&&<text x={mid.x+8} y={mid.y-10} fontSize="9" fill={color}>{r.sourceObserved?(r.annotation||''):(r.annotation||((r.circuitIds.length?r.circuitIds.map(cid=>'C'+plan.circuits.find(c=>c.id===cid)?.number).join(' / '):'Alimentador')+(r.size==='A confirmar'?'': ' · '+r.size)))}</text>}{showRouteLengths&&<RouteDimensions points={pts}/>}</g>;})}
 {showNodes&&nodes.map(object)}
 </>;
}
