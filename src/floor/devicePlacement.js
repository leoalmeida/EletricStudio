import {wallSegments,projectToWall} from './architecture.js';
import {socketConfigTypes,commandTypes} from './deviceConfig.js';
export const wallMounted=type=>[...socketConfigTypes.filter(t=>!['socketFloor','threePhasePower'].includes(t)),...commandTypes,'wallLight'].includes(type);
// The local stem ends at (0,24); its endpoint meets the wall surface.
export function snapDevice(plan,o,maxDistance=45){
 if(!wallMounted(o.type))return o;
 const walls=wallSegments(plan.objects.filter(v=>!v.openArea&&v.width>=4));
 const nearest=walls.map(w=>({w,p:projectToWall(o,w)})).filter(v=>v.p&&v.p.t>=0&&v.p.t<=1&&v.p.distance<=maxDistance).sort((a,b)=>a.p.distance-b.p.distance)[0];
 if(!nearest)return o;
 const {w,p}=nearest,dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,len=Math.hypot(dx,dy);let nx=-dy/len,ny=dx/len;
 const side=(o.x-p.x)*nx+(o.y-p.y)*ny;
 if(side<-.01||(Math.abs(side)<=.01&&(-Math.sin(o.rotation*Math.PI/180)*nx+Math.cos(o.rotation*Math.PI/180)*ny)>0)){nx=-nx;ny=-ny;}
 const offset=24+w.width/2;
 const x=p.x+nx*offset,y=p.y+ny*offset;
 if(x<0||y<0||x>plan.width||y>plan.height)return o;
 return {...o,x:Math.round(x*100)/100,y:Math.round(y*100)/100,rotation:((Math.atan2(nx,-ny)*180/Math.PI)%360+360)%360};
}
export const socketHeightStyle=height=>height===null||height===undefined?'unknown':height>=2.2?'high':height>=1.2?'medium':'low';
