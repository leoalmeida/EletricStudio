import React from 'react';
import {spec,ports} from './catalog.js';

export default function Symbol({c,on=false,active=false}){
 const s=spec(c.type),ps=ports(c),xs=ps.map(p=>p[0]),max=Math.max(0,...xs),min=Math.min(0,...xs),center=(min+max)/2;
 const text=(x,y,value,size=11)=><text x={x} y={y} fontSize={size} textAnchor="middle" fill="currentColor" stroke="none">{value}</text>;
 const coil=(x=0,mark='')=><g><path d={`M${x} 0V22M${x} 58V80`}/><rect x={x-17} y="22" width="34" height="36" fill={on?'#dcfce7':'white'}/>{mark&&text(x,44,mark,9)}</g>;
 const contact=(x,nc=false,shape='contact',i=0)=>{const closed=nc?!active:active;return <g key={i}><path d={`M${x} 0V22M${x} 58V80M${x-5} 22H${x+5}M${x-5} 58H${x+5}`}/><path d={closed?`M${x} 22V58`:`M${x} 58L${x-15} 26`}/>{shape==='breaker'&&<path d={`M${x-9} 15L${x+1} 25M${x+1} 15L${x-9} 25`}/>} {shape==='rcd'&&<circle cx={x} cy="12" r="7"/>}{shape==='thermal'&&<path d={`M${x-12} 28V51H${x-5}`}/>}</g>;};
 let body;
 if(s.shape==='source')body=<><path d="M-16 40H16"/>{text(0,25,c.type==='source'?'L / +':'N / −')}</>;
 else if(s.shape==='supply3')body=ps.map(([x],i)=><g key={i}><path d={`M${x} 30V80M${x-10} 30H${x+10}`}/>{text(x,20,s.pins[i])}</g>);
 else if(s.shape==='ground')body=<path d="M0 0V30M-18 30H18M-12 37H12M-5 44H5"/>;
 else if(s.shape==='coil')body=coil(0,s.mark);
 else if(s.shape==='assembly')body=<>{coil()}<path d={`M20 40H${max}`} strokeDasharray="3 3"/>{s.pairs.map(([i],n)=>contact(ps[i][0],s.normallyClosed.includes(n),'contact',n))}</>;
 else if(s.shape==='changeover')body=<><path d="M0 0V24M-20 58V80M20 58V80M-25 58H-15M15 58H25"/><path d={`M0 24L${active?20:-20} 58`}/>{s.mark&&text(30,35,s.mark)}</>;
 else if(s.shape==='fuse')body=(s.pairs||[[0,1]]).map(([i],n)=>{const x=ps[i][0];return <g key={n}><path d={`M${x} 0V22M${x} 58V80`}/><rect x={x-9} y="22" width="18" height="36"/>{!active&&<path d={`M${x} 22V58`}/>}</g>;});
 else if(s.shape==='terminal')body=<><path d="M0 0V80"/><rect x="-13" y="28" width="26" height="24"/><circle cy="40" r="4"/></>;
 else if(s.shape==='motor')body=<><path d="M0 0V17M0 63V80"/><circle cy="40" r="23" fill={on?'#dcfce7':'white'}/>{text(0,44,'M',17)}{s.mark!=='M'&&text(0,57,s.mark,9)}{ps.length>2&&<path d="M40 80V58M30 58H50M34 52H46M38 47H42"/>}</>;
 else if(s.shape==='motorMulti'){const m=Math.max(...ps.slice(0,-1).map(p=>p[0])),cx=m/2;body=<><ellipse cx={cx} cy="40" rx={Math.max(26,cx+14)} ry="24" fill="white"/>{text(cx,40,'M',18)}{text(cx,55,s.mark,9)}{ps.slice(0,-1).map(([x,y],i)=><path key={i} d={`M${x} ${y}V${y===0?20:60}`}/>)}<path d={`M${ps.at(-1)[0]} 80V55m-10 0h20m-16 -6h12m-8 -6h4`}/>{c.type==='motorCap'&&<path d="M-20 20H-32V32M-40 32H-24M-40 39H-24M-32 39V60H-20"/>}</>;}
 else if(s.shape==='lamp')body=<><path d="M0 0V21M0 59V80"/><circle cy="40" r="19" fill={on?(c.color||'#22c55e'):'white'}/><path d="M-13 27L13 53M13 27L-13 53"/></>;
 else if(s.shape==='buzzer')body=<><path d="M0 0V22M0 58V80M-17 58V39A17 17 0 0 1 17 39V58Z" fill={on?'#fef3c7':'white'}/><path d="M25 28Q38 40 25 52M31 21Q50 40 31 59" stroke={on?'#d99013':'currentColor'}/></>;
 else if(s.shape==='sensor')body=<><path d="M0 0V22M0 58V80"/><rect x="-17" y="22" width="34" height="36" fill={active?'#dbeafe':'white'}/><path d="M-10 48L10 32M5 32H10V37"/>{c.sensorWires!==2&&<path d={c.lateral?'M17 40H40':'M17 40H40V80'}/>}</>;
 else if(s.shape==='drive')body=<>{ps.map(([x,y],i)=><path key={i} d={`M${x} ${y}V${y===0?20:60}`}/>)}<rect x="-15" y="20" width={max+30} height="40" fill="white"/>{text(center,44,s.mark,Math.min(12,70/(s.mark?.length||1)))}</>;
 else if(s.shape==='transformer'||s.shape==='autotrafo')body=<>{[...new Set(ps.filter((_,i)=>s.shape!=='autotrafo'||i%3===0).map(([x])=>x))].map((x,i)=><g key={i}><path d={`M${x} 0V20M${x} 60V80M${x} 20c-12 0 -12 10 0 10c-12 0 -12 10 0 10c-12 0 -12 10 0 10c-12 0 -12 10 0 10`}/>{s.shape==='autotrafo'&&<path d={`M${x} 40H${x+20}`}/>}</g>)}{s.shape==='transformer'&&<path d={`M${center-3} 17V63M${center+3} 17V63`}/>}</>;
 else body=<>{(s.pairs||[[0,1]]).map(([i],n)=>contact(ps[i][0],s.normallyClosed?s.normallyClosed.includes(n):s.normal,s.shape,n))}{(s.pairs?.length||0)>1&&<path d={`M-16 40H${max+4}`} strokeDasharray="3 3"/>}{['push','emergency','limit'].includes(s.shape)&&<><path d="M-28 34H-16M-28 28V40"/>{s.shape==='emergency'?<path d="M-35 25Q-28 18 -21 25Z"/>:s.shape==='limit'?<circle cx="-31" cy="27" r="4"/>:s.interaction==='hold'?<path d="M-24 43l-4 4 4 4 -4 4"/>:null}</>}{s.mark&&text(-24,60,s.mark)}</>;
 return <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{body}</g>;
}
