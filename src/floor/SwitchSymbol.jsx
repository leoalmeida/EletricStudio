import React from 'react';

export default function SwitchSymbol({type}){
 if(type==='presenceSensor')return <><path d="M-15 -9H15A15 15 0 0 1 -15 -9Z" fill="white"/><path d="M-10 10Q0 19 10 10M-7 13Q0 20 7 13M-3 17Q0 20 3 17" stroke="#cc746b" strokeWidth="1.4"/><path d="M-5 21L-10 28M0 22V29M5 21L10 28" strokeWidth="1.2"/></>;
 const bipolar=['switchBipolar','switch2Bipolar'].includes(type);
 return <><circle r="9" fill={type==='switch2'?'currentColor':'white'}/>{type==='switch3'&&<path d="M0 -9A9 9 0 0 0 0 9Z" fill="currentColor"/>}{type==='switchDouble'&&<path d="M0 -9V9"/>}{type==='switchTriple'&&<path d="M0 0V-9M0 0L-7.8 4.5M0 0L7.8 4.5"/>}{type==='switchBipolar'&&<path d="M0 0H9A9 9 0 0 1 0 9Z" fill="currentColor"/>}{type==='switch2Bipolar'&&<path d="M0 0V-9A9 9 0 1 1 -9 0Z" fill="currentColor"/>}<path d="M0 9V24"/>{bipolar&&<text x="13" y="6" fontSize="7" fill="currentColor" stroke="none">2P</text>}</>;
}
