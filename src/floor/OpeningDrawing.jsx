import React from 'react';

export default function OpeningDrawing({o}){
 const w=o.width,t=o.wallThickness||16;
 return <g fill="white" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter">
  <path d={`M0 0V${w}`} stroke="white" strokeWidth={t+4}/>
  <path d={`M${-t/2} 0H${t/2}M${-t/2} ${w}H${t/2}`} strokeWidth="2"/>
  {o.type==='slidingDoorSingle'&&<><rect x="-3" y="1" width="5" height={Math.max(1,w-2)}/><path d={`M-9 1V${w-1}M8 1V${w-1}`} strokeWidth=".6"/><path d={`M16 ${w*.2}V${w*.8}m-4 -6 4 6 4 -6`} fill="none" stroke="#7a9296"/></>}
  {['opening','slidingDoorSingle'].includes(o.type)?null:o.type==='window'?<><rect x={-t/2+1} y="2" width={t-2} height={Math.max(1,w-4)} fill="#eef8fa"/><path d={`M-2 2V${w-2}M2 2V${w-2}`}/><path d={`M${-t/2} ${w/2}H${t/2}`} strokeWidth="1"/>{o.windowShape==='round'&&<circle cy={w/2} r={Math.max(2,t/3)} fill="white"><title>Janela redonda</title></circle>}</>:o.type==='slidingDoor'?<><rect x="-5" y="1" width="4" height={w/2+8}/><rect x="1" y={w/2-8} width="4" height={w/2+7}/><path d={`M-10 5V${w-5}M10 5V${w-5}`} strokeWidth=".6"/><path d={`M-16 ${w*.18}v${w*.16}l-3 -5m3 5 3 -5M16 ${w*.82}v-${w*.16}l-3 5m3 -5 3 5`} fill="none" stroke="#7a9296"/></>:<g transform={o.flip?'scale(-1 1)':undefined}>{o.leaves===2?<><rect x="0" y="-1.5" width={w/2} height="3"/><rect x="0" y={w-1.5} width={w/2} height="3"/><path d={`M${w/2} 0A${w/2} ${w/2} 0 0 1 0 ${w/2}M0 ${w/2}A${w/2} ${w/2} 0 0 1 ${w/2} ${w}`} fill="none" stroke="#809194" strokeWidth="1"/><circle r="2"/><circle cy={w} r="2"/></>:<><rect x="0" y="-1.5" width={w} height="3"/><path d={`M${w} 0A${w} ${w} 0 0 1 0 ${w}`} fill="none" stroke="#809194" strokeWidth="1"/><circle r="2"/></>}</g>}
 </g>;
}
