export const openingTypes=['door','window','opening','slidingDoorSingle','slidingDoor'];
export const roomToolShapes={roomLSE:'l-se',roomLSW:'l-sw',roomLNE:'l-ne',roomLNW:'l-nw'};
export const roomShapes=[{id:'rectangle',label:'Retangular'},{id:'l-se',label:'Em L — recorte inferior direito'},{id:'l-sw',label:'Em L — recorte inferior esquerdo'},{id:'l-ne',label:'Em L — recorte superior direito'},{id:'l-nw',label:'Em L — recorte superior esquerdo'}];
export const isRoomTool=type=>type==='room'||Object.hasOwn(roomToolShapes,type);
export function roomPoints(o){
 const x=Math.min(o.x,o.x2),y=Math.min(o.y,o.y2),w=Math.abs(o.x2-o.x),h=Math.abs(o.y2-o.y);
 if(!o.shape||o.shape==='rectangle')return [{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];
 const cw=o.cutWidth??w/2,ch=o.cutDepth??h/2,flipX=o.shape.endsWith('w'),flipY=o.shape.startsWith('l-n');
 return [[0,0],[w,0],[w,h-ch],[w-cw,h-ch],[w-cw,h],[0,h]].map(([px,py])=>({x:x+(flipX?w-px:px),y:y+(flipY?h-py:py)}));
}
export const roomPath=o=>roomPoints(o).map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ')+' Z';
export function roomArea(o){const w=Math.abs(o.x2-o.x),h=Math.abs(o.y2-o.y);return (w*h-(!o.shape||o.shape==='rectangle'?0:(o.cutWidth??w/2)*(o.cutDepth??h/2)))/10000;}
export function roomLabelPoint(o){
 const x=Math.min(o.x,o.x2),y=Math.min(o.y,o.y2),w=Math.abs(o.x2-o.x),h=Math.abs(o.y2-o.y);
 if(!o.shape||o.shape==='rectangle')return {x:x+w/2,y:y+h/2};
 const cw=o.cutWidth??w/2,ch=o.cutDepth??h/2,horizontal=w*(h-ch)>=(w-cw)*h;
 let px=horizontal?w/2:(w-cw)/2,py=horizontal?(h-ch)/2:h/2;
 if(o.shape.endsWith('w'))px=w-px;if(o.shape.startsWith('l-n'))py=h-py;return {x:x+px,y:y+py};
}
export const roomCategories=['Sala de estar','Sala de jantar','Quarto','Cozinha','Banheiro','Corredor / Ligação','Área de serviço','Garagem','Varanda','Área externa','Outro'];
export function wallSegments(objects){return objects.flatMap(o=>{
 if(o.type==='wall')return [{id:o.id,side:'Parede',a:{x:o.x,y:o.y},b:{x:o.x2,y:o.y2},width:o.width,height:o.wallHeight||2.8}];
 if(o.type!=='room')return [];
 const points=roomPoints(o),rect=!o.shape||o.shape==='rectangle';
 return points.map((p,i)=>{let a=p,b=points[(i+1)%points.length];if(b.x<a.x||(b.x===a.x&&b.y<a.y))[a,b]=[b,a];return {id:o.id,side:rect?['Superior','Direita','Inferior','Esquerda'][i]:'Parede '+(i+1)+([2,3].includes(i)?' (recorte)':''),a,b,width:o.width,height:o.wallHeight||2.8};});
});}
export function projectToWall(point,wall){
 const dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y,length=Math.hypot(dx,dy);if(length<.01)return null;
 const t=((point.x-wall.a.x)*dx+(point.y-wall.a.y)*dy)/(length*length),x=wall.a.x+Math.max(0,Math.min(1,t))*dx,y=wall.a.y+Math.max(0,Math.min(1,t))*dy;
 return {x,y,t,length,distance:Math.hypot(point.x-x,point.y-y)};
}
export function snapOpening(plan,o){
 const nearest=wallSegments(plan.objects).map(w=>({w,p:projectToWall(o,w)})).filter(v=>v.p&&v.p.distance<=Math.max(25,v.w.width*1.5)&&v.p.length>=o.width).sort((a,b)=>a.p.distance-b.p.distance)[0];
 if(!nearest)return o;
 const {w,p}=nearest,t=Math.max(0,Math.min(1-o.width/p.length,p.t));
 return {...o,x:w.a.x+(w.b.x-w.a.x)*t,y:w.a.y+(w.b.y-w.a.y)*t,rotation:(Math.atan2(w.b.y-w.a.y,w.b.x-w.a.x)*180/Math.PI+270)%360,wallThickness:w.width};
}
