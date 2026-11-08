import {roomPoints} from './architecture.js';
import {validPolygon,polygonRoom} from './polygon.js';
export const cornerPoints=object=>object.type==='room'?roomPoints(object):object.type==='wall'?[{x:object.x,y:object.y},{x:object.x2,y:object.y2}]:[];
export function moveCorner(plan,objectId,index,dx,dy){const object=plan.objects.find(o=>o.id===objectId);if(!object||![dx,dy].every(Number.isFinite))return plan;const points=cornerPoints(object);if(!points[index])return plan;points[index]={x:Math.max(0,Math.min(plan.width,points[index].x+dx)),y:Math.max(0,Math.min(plan.height,points[index].y+dy))};let next;
 if(object.type==='wall'){if(Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)<10)return plan;next={...object,x:points[0].x,y:points[0].y,x2:points[1].x,y2:points[1].y};}
 else{if(!validPolygon(points)||Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))<10||Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))<10)return plan;next=polygonRoom(object,points);}
 return {...plan,objects:plan.objects.map(o=>o.id===objectId?next:o)};
}