export const panelCatalog=[
 {type:'mcb',poles:1,label:'Disjuntor unipolar',modules:1},
 {type:'mcb',poles:2,label:'Disjuntor bipolar',modules:2},
 {type:'mcb',poles:3,label:'Disjuntor tripolar',modules:3},
 {type:'dr',poles:2,label:'DR',modules:2},
 {type:'ddr',poles:2,label:'DDR',modules:2},
 {type:'idr',poles:2,label:'IDR',modules:2},
 {type:'dps',poles:1,label:'DPS',modules:1}
];
export const panelLayout=board=>board.panelLayout||{rows:2,slotsPerRow:8,devices:[]};
export const deviceName=d=>d.type==='mcb'?({1:'Disjuntor unipolar',2:'Disjuntor bipolar',3:'Disjuntor tripolar'})[d.poles]:({dr:'DR',ddr:'DDR',idr:'IDR',dps:'DPS'})[d.type];
export function makePanelDevice(preset=panelCatalog[0],row=0,slot=0){return {id:crypto.randomUUID(),type:preset.type,poles:preset.poles,modules:preset.modules,row,slot,label:'',rating:null,sensitivity:30,curve:'C',state:'on',circuitIds:[],surgeKA:null,voltage:null};}
export function validPanelLayout(layout,circuitIds){
 if(!layout||!Number.isInteger(layout.rows)||layout.rows<1||layout.rows>8||!Number.isInteger(layout.slotsPerRow)||layout.slotsPerRow<4||layout.slotsPerRow>36||!Array.isArray(layout.devices)||layout.devices.length>288)return false;
 const occupied=new Set(),ids=new Set();
 for(const d of layout.devices){
  if(!d||typeof d.id!=='string'||!d.id||ids.has(d.id)||!['mcb','dr','ddr','idr','dps'].includes(d.type)||!Number.isInteger(d.poles)||d.poles<1||d.poles>(d.type==='mcb'?3:4)||!Number.isInteger(d.modules)||d.modules<d.poles||d.modules>12||!Number.isInteger(d.row)||d.row<0||d.row>=layout.rows||!Number.isInteger(d.slot)||d.slot<0||d.slot+d.modules>layout.slotsPerRow||typeof d.label!=='string'||d.label.length>120||!['on','off'].includes(d.state)||!['B','C','D','?'].includes(d.curve)||!Array.isArray(d.circuitIds)||new Set(d.circuitIds).size!==d.circuitIds.length||d.circuitIds.some(cid=>!circuitIds.has(cid)))return false;
  for(const key of ['rating','sensitivity','surgeKA','voltage'])if(d[key]!==null&&(!Number.isFinite(d[key])||d[key]<=0||d[key]>10000))return false;
  ids.add(d.id);for(let i=d.slot;i<d.slot+d.modules;i++){const key=d.row+':'+i;if(occupied.has(key))return false;occupied.add(key);}
 }
 return true;
}
export function freePosition(layout,modules){
 for(let row=0;row<layout.rows;row++)for(let slot=0;slot+modules<=layout.slotsPerRow;slot++)if(!layout.devices.some(d=>d.row===row&&slot<d.slot+d.modules&&slot+modules>d.slot))return {row,slot};
 return null;
}
export function placeDevice(layout,device){
 const next={...layout,devices:[...layout.devices.filter(d=>d.id!==device.id),device]};
 if(!validPanelLayout(next,new Set(next.devices.flatMap(d=>d.circuitIds))))throw Error('O dispositivo não cabe nessa posição ou sobrepõe outro. Escolha módulos livres no mesmo trilho.');
 return next;
}
export function populatePanel(plan,board){
 let layout=structuredClone(panelLayout(board));const linked=new Set(layout.devices.filter(d=>d.type==='mcb'||d.type==='ddr').flatMap(d=>d.circuitIds));
 let added=0,unknown=0,full=0;
 for(const c of plan.circuits.filter(c=>c.panelId===board.id&&!linked.has(c.id))){
  if(c.phase==='?'){unknown++;continue;}
  const poles=c.phase.length,preset=panelCatalog.find(d=>d.type==='mcb'&&d.poles===poles),pos=freePosition(layout,poles);
  if(!pos){full++;continue;}
  const device={...makePanelDevice(preset,pos.row,pos.slot),circuitIds:[c.id],rating:c.breaker};layout=placeDevice(layout,device);linked.add(c.id);added++;
 }
 return {layout,added,unknown,full};
}
