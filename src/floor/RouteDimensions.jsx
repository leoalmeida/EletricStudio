import React from 'react';

export default function RouteDimensions({points}){
 return <g className="floor-route-dimensions" pointerEvents="none" fill="none" stroke="#27905b" strokeWidth="1">
  {points.slice(1).map((end,i)=>{
   let a=points[i],b=end;
   if(b.x<a.x||(b.x===a.x&&b.y<a.y))[a,b]=[b,a];
   const length=Math.hypot(b.x-a.x,b.y-a.y);
   if(length<.01)return null;
   const angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
   return <g key={i} transform={`translate(${a.x} ${a.y}) rotate(${angle})`}>
    <path d={`M0 -4V-30M${length} -4V-30`} opacity=".65"/>
    <path d={`M0 -24H${length}M-4 -20L4 -28M${length-4} -20L${length+4} -28`}/>
    <text x={length/2} y="-30" textAnchor="middle" fontSize="12" fill="#27905b" stroke="white" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round">{(length/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} m</text>
   </g>;
  })}
 </g>;
}
