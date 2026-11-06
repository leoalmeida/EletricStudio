import React from 'react';

export default function StairDrawing({o}){
 const w=o.width,l=o.stairLength||280,steps=o.steps||12,down=o.stairDirection==='down',start=down?l*.15:l*.85,end=down?l*.85:l*.15;
 return <g fill="none" stroke="currentColor" strokeWidth="1.5"><rect x={-w/2} width={w} height={l} fill="white"/>{Array.from({length:steps-1},(_,i)=><path key={i} d={`M${-w/2} ${(i+1)*l/steps}H${w/2}`} stroke="#a1adb1" strokeWidth="1"/>)}<path d={`M0 ${start}V${end}m-6 ${down?-9:9} 6 ${down?9:-9} 6 ${down?-9:9}`} stroke="#5b7e85" strokeWidth="2"/><circle cy={start} r="3" fill="white" stroke="#5b7e85"/><text x={w/2+10} y={l/2} fill="currentColor" stroke="white" strokeWidth="3" paintOrder="stroke" fontSize="12">{o.label|| (down?'Desce':'Sobe')}</text></g>;
}
