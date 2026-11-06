import React from 'react';
import {lightConfigTypes,socketConfigTypes,outletParts,commandsOf,controlledCircuits,presentation} from './deviceConfig.js';

const value=n=>n===null||n===undefined?'?':n.toLocaleString('pt-BR',{maximumFractionDigits:2});
export default function DeviceAnnotations({o,plan}){
 const radians=(o.rotation||0)*Math.PI/180,left=Math.sin(radians)<-.5,above=-Math.cos(radians)<-.5,labelX=o.x+(left?-20:20),anchor=left?'end':'start';
 const flags=presentation(o),circuit=id=>plan?.circuits.find(c=>c.id===id)?.number??'?';
 if(lightConfigTypes.includes(o.type)){
  if(o.type==='light')return <g fontSize="12" textAnchor="middle"><text x={o.x} y={o.y-4}>{flags.power?value(o.power):''}</text><text x={o.x-8} y={o.y+12} fontSize="10">{flags.circuit?circuit(o.circuitId):''}</text><text x={o.x+8} y={o.y+12} fontSize="10">{flags.control?o.control||'':''}</text>{flags.name&&(o.label||o.tag)&&<text x={o.x+24} y={o.y-18} textAnchor="start" fontSize="10">{o.label||o.tag}</text>}</g>;
  return <g fontSize="10">{flags.circuit&&<text x={labelX} y={o.y-16} textAnchor={anchor}>-{circuit(o.circuitId)}-</text>}{flags.power&&<text x={labelX} textAnchor={anchor} y={o.y+4}>{value(o.power)}VA</text>}{flags.control&&o.control&&<text x={labelX} textAnchor={anchor} y={o.y+17}>{o.control}</text>}{flags.height&&<text x={labelX} textAnchor={anchor} y={o.y+30}>{Number.isFinite(o.height)?'h='+value(o.height*100)+' cm':'h: a confirmar'}</text>}{flags.name&&(o.label||o.tag)&&<text x={o.x} y={o.y-20} textAnchor="middle">{o.label||o.tag}</text>}</g>;
 }
 if(o.type==='phone')return flags.height?<text x={o.x+20} y={o.y+4} fontSize="10">h={value(o.height===null?null:o.height*1000)}mm</text>:null;
 const commands=commandsOf(o);
 return <g fontSize="10">{socketConfigTypes.includes(o.type)&&outletParts(o).map((p,i,array)=>{const visible={...flags,...p.presentation},y=o.y+(above?-20:4)+(i-(array.length-1)/2)*27,right=[visible.name?p.name:'',visible.power?value(p.power)+'VA':'',visible.height?'h='+value(p.height===null?null:p.height*100)+'cm':'',visible.voltage?value(p.voltage)+'V':''].filter(Boolean).join(' · ');return <g key={i}>{visible.circuit&&<text x={labelX} y={y-9} textAnchor={anchor}>-{circuit(p.circuitId)}-</text>}<text x={labelX} y={y+4} textAnchor={anchor}>{right}</text></g>;})}{commands.map((c,i)=>c.visible&&c.name&&<g key={i}><text x={o.x+(i-(commands.length-1)/2)*17} y={o.y-29} textAnchor="middle">{c.name}</text>{!socketConfigTypes.includes(o.type)&&<text x={o.x+17} y={o.y+4+i*12}>{controlledCircuits(plan,c.name).map(circuit).join('/')}</text>}</g>)}</g>;
}
