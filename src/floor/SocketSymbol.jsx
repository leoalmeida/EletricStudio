import React from 'react';
import {socketHeightStyle} from './devicePlacement.js';
import {outletParts} from './deviceConfig.js';

export default function SocketSymbol({type,object}){
 if(type==='threePhasePower')return <><circle r="15"/><path d="M0 -24V-15M0 15V24M-11 8L0 -11L11 8Z"/><text x="0" y="6" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none">3~</text></>;
 const combined=['socketSwitch','socketSwitchDouble','socketDoubleSwitch','socketParallelSwitch'].includes(type),count=type==='socketTriple'?3:['socketDouble','socketDoubleSwitch'].includes(type)?2:1;
 return <>{type==='socketFloor'&&<rect x="-15" y="-16" width="30" height="32" fill="white"/>}{Array.from({length:count},(_,i)=>{const y=(i-(count-1)/2)*10,h=object?outletParts(object)[i]?.height:({socketLow:.3,socketMid:1.2,socketHigh:2.2})[type],style=socketHeightStyle(h);return <g key={i}><path key={i} d={count===1?`M-11 10L0 -12L11 10Z`:`M-10 ${y+7}L0 ${y-10}L10 ${y+7}Z`} fill={style==='high'?'currentColor':'white'}/>{style==='medium'&&<path d={count===1?`M-5.5 -1H5.5L11 10H-11Z`:`M-5 ${y-1.5}H5L10 ${y+7}H-10Z`} fill="currentColor"/>}</g>;})}<path d={'M0 10V24'}/>{combined&&<><path d="M0 -12V-17"/>{type==='socketSwitchDouble'?<><circle cx="-5" cy="-21" r="3.5" fill="white"/><circle cx="5" cy="-21" r="3.5" fill="white"/><path d="M-5 -17H5"/></>:<circle cy="-21" r="4" fill={type==='socketParallelSwitch'?'currentColor':'white'}/>}</>}</>;
}
