import {id,validatePlan} from './model.js';
import {withFloors} from './floors.js';

const floors=p=>p.floors.map(f=>({...f,data:f.id===p.activeFloorId?p:f.data}));
export const isEditingText=target=>Boolean(target?.isContentEditable||target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'));
export function copySelection(project,selectedIds){
 const p=withFloors(project),chosen=new Set(selectedIds);
 // A selected route needs both endpoints to remain a valid, independent copy.
 for(const r of p.routes)if(chosen.has(r.id)){chosen.add(r.from);chosen.add(r.to);}
 const objects=p.objects.filter(o=>chosen.has(o.id));if(!objects.length)return null;
 const routes=p.routes.filter(r=>chosen.has(r.from)&&chosen.has(r.to));
 const circuitIds=new Set([...objects.flatMap(o=>[o.circuitId,...(o.outlets||[]).map(v=>v.circuitId),...(o.panelLayout?.devices||[]).flatMap(d=>d.circuitIds)]),...routes.flatMap(r=>[...r.circuitIds,...(r.wires||[]).map(w=>w.circuitId)])].filter(Boolean));
 const circuits=p.circuits.filter(c=>circuitIds.has(c.id)),panels={};
 for(const c of circuits){const panelId=c.panelId||c.remotePanel?.id;for(const f of floors(p)){const board=f.data.objects.find(o=>o.id===panelId);if(board)panels[c.id]={id:board.id,floorId:f.id,floorName:f.name,tag:board.tag,label:board.label};}}
 return structuredClone({sourceFloorId:p.activeFloorId,objects,routes,circuits,panels});
}
export function pasteSelection(project,clipboard,offset=0){
 if(!clipboard?.objects?.length)throw Error('Selecione componentes e use Ctrl+C antes de colar.');
 const p=withFloors(project),data=structuredClone(clipboard),objectIds=new Map(data.objects.map(o=>[o.id,id()])),circuitIds=new Map(),circuits=[...p.circuits],usedNumbers=new Set(circuits.map(c=>c.number));
 for(const c of data.circuits){const panel=data.panels[c.id]||c.remotePanel,copyPanel=objectIds.get(c.panelId||panel?.id);let cid=c.id;
  if(copyPanel||!circuits.some(v=>v.id===cid)){
   if(copyPanel)cid=id();let number=c.number;while(usedNumbers.has(number))number++;usedNumbers.add(number);
   const localPanel=copyPanel||p.objects.find(o=>o.id===panel?.id)?.id||'';
   const next={...c,id:cid,number,panelId:localPanel};delete next.sizing;
   if(localPanel)delete next.remotePanel;
   else if(panel&&floors(p).some(f=>f.id===panel.floorId&&f.data.objects.some(o=>o.id===panel.id)))next.remotePanel=panel;
   else delete next.remotePanel;
   circuits.push(next);
  }circuitIds.set(c.id,cid);
 }
 const cid=value=>value?circuitIds.get(value)||'':'';
 const objects=data.objects.map(o=>{const next={...o,id:objectIds.get(o.id),circuitId:cid(o.circuitId)};
  if(o.outlets)next.outlets=o.outlets.map(v=>({...v,circuitId:cid(v.circuitId)}));
  if(o.panelLayout)next.panelLayout={...o.panelLayout,devices:o.panelLayout.devices.map(d=>({...d,id:id(),circuitIds:d.circuitIds.map(cid)}))};
  // A duplicate must not claim the original cross-floor continuation or sizing report.
  for(const key of ['peerObjectId','continuationId','originalRouteId','sizing','feederSizing'])delete next[key];
  if(next.targetFloorId===p.activeFloorId)next.targetFloorId='';return next;
 });
 const routes=data.routes.map(r=>{const next={...r,id:id(),from:objectIds.get(r.from),to:objectIds.get(r.to),circuitIds:r.circuitIds.map(cid),wires:(r.wires||[]).map(w=>({...w,id:id(),circuitId:cid(w.circuitId)}))};for(const key of ['continuationId','originalRouteId','sizing'])delete next[key];return next;});
 const points=[...objects.flatMap(o=>[{x:o.x,y:o.y},{x:o.x2,y:o.y2}]),...routes.flatMap(r=>r.points)],left=Math.min(...points.map(v=>v.x)),right=Math.max(...points.map(v=>v.x)),top=Math.min(...points.map(v=>v.y)),bottom=Math.max(...points.map(v=>v.y));
 if(right-left>p.width||bottom-top>p.height)throw Error('Os componentes copiados não cabem no pavimento de destino.');
 const dx=Math.max(-left,Math.min(p.width-right,offset)),dy=Math.max(-top,Math.min(p.height-bottom,offset));
 for(const o of objects){o.x+=dx;o.x2+=dx;o.y+=dy;o.y2+=dy;}for(const r of routes)r.points=r.points.map(v=>({...v,x:v.x+dx,y:v.y+dy}));
 const plan=validatePlan({...p,objects:[...p.objects,...objects],routes:[...p.routes,...routes],circuits});
 return {plan,selectedIds:objects.map(o=>o.id),routeCount:routes.length};
}
