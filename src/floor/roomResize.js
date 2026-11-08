import {validPolygon,polygonRoom} from './polygon.js';
import {roomPoints,projectToWall,openingTypes} from './architecture.js';
import {wallMounted} from './devicePlacement.js';
export const roomEdges=room=>{const points=roomPoints(room);return points.map((a,index)=>({index,a,b:points[(index+1)%points.length]}));};
export function hitRoomEdge(room,point,tolerance=12){return roomEdges(room).map(edge=>({...edge,projection:projectToWall(point,edge)})).filter(edge=>edge.projection&&edge.projection.distance<=tolerance).sort((a,b)=>a.projection.distance-b.projection.distance)[0]||null;}
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function resizeRoom(plan,roomId,edgeIndex,delta){
 const room=plan.objects.find(o=>o.id===roomId&&o.type==='room');if(!room)return plan;const edge=roomEdges(room)[edgeIndex];if(!edge||!Number.isFinite(delta))return plan;
 if(room.vertices){const points=roomPoints(room),length=Math.hypot(edge.b.x-edge.a.x,edge.b.y-edge.a.y),nx=-(edge.b.y-edge.a.y)/length,ny=(edge.b.x-edge.a.x)/length;for(const index of [edgeIndex,(edgeIndex+1)%points.length])points[index]={x:points[index].x+nx*delta,y:points[index].y+ny*delta};if(!validPolygon(points)||points.some(p=>p.x<0||p.y<0||p.x>plan.width||p.y>plan.height))return plan;return {...plan,objects:plan.objects.map(o=>o.id===roomId?polygonRoom(room,points):o)};}
 const vertical=edge.a.x===edge.b.x,axis=vertical?'x':'y',oldCoordinate=edge.a[axis],l=Math.min(room.x,room.x2),r=Math.max(room.x,room.x2),t=Math.min(room.y,room.y2),b=Math.max(room.y,room.y2),isL=room.shape&&room.shape!=='rectangle',cw=room.cutWidth??(r-l)/2,ch=room.cutDepth??(b-t)/2;
 let left=l,right=r,top=t,bottom=b,cutWidth=cw,cutDepth=ch;
 const minimum=40,target=oldCoordinate+delta;
 if(vertical){if(oldCoordinate===l)left=clamp(target,0,r-(isL?cw:0)-minimum);else if(oldCoordinate===r)right=clamp(target,l+(isL?cw:0)+minimum,plan.width);else cutWidth=clamp(room.shape.endsWith('w')?target-l:r-target,20,r-l-minimum);}
 else{if(oldCoordinate===t)top=clamp(target,0,b-(isL?ch:0)-minimum);else if(oldCoordinate===b)bottom=clamp(target,t+(isL?ch:0)+minimum,plan.height);else cutDepth=clamp(room.shape.startsWith('l-n')?target-t:b-target,20,b-t-minimum);}
 const resized={...room,x:left,x2:right,y:top,y2:bottom,...(isL?{cutWidth,cutDepth}:{})},newEdge=roomEdges(resized)[edgeIndex],actualDelta=newEdge.a[axis]-oldCoordinate;
 if(!actualDelta)return plan;
 const objects=plan.objects.map(o=>{if(o.id===roomId)return resized;if(!openingTypes.includes(o.type)&&!wallMounted(o.type))return o;
 const angle=(o.rotation||0)*Math.PI/180,anchor=openingTypes.includes(o.type)?o:{x:o.x-Math.sin(angle)*24,y:o.y+Math.cos(angle)*24},projection=projectToWall(anchor,edge);
 if(!projection||projection.t<0||projection.t>1||projection.distance>(room.width||12)/2+3)return o;
 const nearest=roomEdges(room).map(e=>({edge:e,p:projectToWall(anchor,e)})).filter(v=>v.p).sort((a,b)=>a.p.distance-b.p.distance)[0];if(nearest.edge.index!==edgeIndex)return o;
 const coordinate=o[axis]+actualDelta;if(coordinate<0||coordinate>plan[vertical?'width':'height'])return o;
 const endpoint=axis+'2';return {...o,[axis]:coordinate,[endpoint]:clamp(o[endpoint]+actualDelta,0,plan[vertical?'width':'height'])};
 });
 return {...plan,objects};
}