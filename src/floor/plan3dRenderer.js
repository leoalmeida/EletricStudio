import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {boardTypes,lightingTypes} from './model.js';

export function createPlanRenderer(host,data,onError){
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.setClearColor('#e8efed');
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Planta 3D: arraste para girar, botão direito para deslocar, rolagem para zoom');
 canvas.setAttribute('aria-describedby','plan3d-help');host.append(canvas);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x81968d,2.5));
 const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-10,25,15);scene.add(light);
 const root=new THREE.Group(),walls=new THREE.Group(),devices=new THREE.Group(),routes=new THREE.Group(),labels=new THREE.Group();
 const furnishingGroup=new THREE.Group(),structureGroup=new THREE.Group(),roofGroup=new THREE.Group(),terrainGroup=new THREE.Group();root.add(walls,devices,routes,labels,furnishingGroup,structureGroup,roofGroup,terrainGroup);scene.add(root);
 const materials=new Map();
 function material(color,opacity=1){const key=color+':'+opacity;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.85,transparent:opacity<1,opacity,side:THREE.DoubleSide}));return materials.get(key);}
 function mesh(geometry,color,parent= root,opacity=1){const m=new THREE.Mesh(geometry,material(color,opacity));parent.add(m);return m;}
 function box(w,h,d,x,y,z,color,parent=root,opacity=1){const m=mesh(new THREE.BoxGeometry(w,h,d),color,parent,opacity);m.position.set(x,y,z);return m;}
 for(const room of data.rooms){const shape=new THREE.Shape(room.points.map(p=>new THREE.Vector2(p.x,-p.z)));const m=mesh(new THREE.ShapeGeometry(shape),'#fafaf5');m.rotation.x=-Math.PI/2;m.position.y=(room.points[0]?.y||0)+.005;}
 const {minX,maxX,minZ,maxZ}=data.bounds,cx=(minX+maxX)/2,cz=(minZ+maxZ)/2;
 const minY=data.bounds.minY??0,maxY=data.bounds.maxY??data.ceiling;
 const span=Math.max(maxX-minX,maxZ-minZ,maxY-minY,4),center=new THREE.Vector3(cx,(minY+maxY)/2,cz);
 if(data.rooms.length===0)box(Math.max(1,maxX-minX)+.5,.04,Math.max(1,maxZ-minZ)+.5,cx,minY-.025,cz,'#f5f5ee');
 const grid=new THREE.GridHelper(Math.ceil(span+8),Math.ceil(span+8),0xc7d6d0,0xd9e2de);grid.position.set(cx,minY-.06,cz);root.add(grid);
 for(const wall of data.walls){
  const group=new THREE.Group();group.position.set(wall.a.x,wall.a.y||0,wall.a.z);group.rotation.y=-Math.atan2(wall.b.z-wall.a.z,wall.b.x-wall.a.x);walls.add(group);
  // Partition at opening edges: rectangular doorways stay genuinely open to the floor.
  const cuts=[...new Set([0,wall.length,...wall.openings.flatMap(o=>[o.x,o.x+o.width])])].sort((a,b)=>a-b);
  for(let i=1;i<cuts.length;i++){
   const a=cuts[i-1],b=cuts[i],mid=(a+b)/2;if(b-a<.001)continue;
   const openings=wall.openings.filter(o=>o.x<mid&&o.x+o.width>mid);
   const intervals=openings.map(o=>[o.bottom,o.bottom+o.height]).sort((a,b)=>a[0]-b[0]);let y=0;
   for(const [bottom,top] of [...intervals,[wall.height,wall.height]]){if(bottom>y)box(b-a,bottom-y,wall.width,mid,(bottom+y)/2,0,'#d8dcd3',group);y=Math.max(y,top);}
  }
  for(const o of wall.openings){
   if(o.type==='opening')continue;
   if(o.type==='window'){
    const round=o.shape==='round';
    if(round){
     // Fill the corners of the rectangular wall cut around the circular aperture.
     const shape=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(o.width,0),new THREE.Vector2(o.width,o.height),new THREE.Vector2(0,o.height)]);
     const hole=new THREE.Path();hole.absellipse(o.width/2,o.height/2,o.width/2,o.height/2,0,Math.PI*2,true);shape.holes.push(hole);
     const geo=new THREE.ExtrudeGeometry(shape,{depth:wall.width,bevelEnabled:false,curveSegments:24});geo.translate(o.x,o.bottom,-wall.width/2);mesh(geo,'#d8dcd3',group);
     const glass=mesh(new THREE.CircleGeometry(.5,40),'#91c8d0',group,.5);glass.scale.set(o.width,o.height,1);glass.position.set(o.x+o.width/2,o.bottom+o.height/2,0);
    }else{
     box(o.width,o.height,.025,o.x+o.width/2,o.bottom+o.height/2,0,'#91c8d0',group,.45);
     for(const x of [o.x,o.x+o.width/2,o.x+o.width])box(.025,o.height,.05,x,o.bottom+o.height/2,0,'#667e7a',group);
     for(const y of [o.bottom,o.bottom+o.height])box(o.width,.025,.05,o.x+o.width/2,y,0,'#667e7a',group);
    }
   }else{
    const door=box(o.width,o.height,.035,o.x+o.width/2,o.bottom+o.height/2,0,'#c1b09a',group,.36);
    door.userData.opening=true;
   }
  }
 }
 function label(text,position){
  if(!text)return;const c=document.createElement('canvas');c.width=1024;c.height=80;const ctx=c.getContext('2d');ctx.font='500 32px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillRect(0,0,1024,80);ctx.fillStyle='#274c45';ctx.fillText(text.slice(0,100),512,52,1000);
  const texture=new THREE.CanvasTexture(c),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(3,.235,1);sprite.position.copy(position);labels.add(sprite);
 }
 for(const room of data.rooms){if(room.label&&room.labelPosition)label([room.floorName,room.label,room.area.toFixed(2)+' m² · h '+room.height.toFixed(2)+' m'].filter(Boolean).join(' · '),new THREE.Vector3(room.labelPosition.x,room.labelPosition.y,room.labelPosition.z));}
 for(const d of data.devices){if(!d.position)continue;const {x,y,z}=d.position,board=boardTypes.includes(d.type),lit=lightingTypes.includes(d.type),color=d.assumed?'#b9773b':lit?'#f4be48':board?'#3d5752':'#304942';
  const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=-(d.rotation||0)*Math.PI/180;devices.add(group);
  if(lit){const m=mesh(new THREE.SphereGeometry(.075,12,8),color,group);m.scale.y=.55;box(.17,.025,.17,0,.05,0,'#f8e7b3',group);}
  else{box(board?.32:.10,board?.48:.15,board?.10:.055,0,0,0,color,group);box(board?.25:.065,board?.35:.09,.006,0,0,.06,'#e5e9df',group);}
  label(d.tag,new THREE.Vector3(x,y+.18,z));
 }
 function tube(points,color,radius,parent){
  for(let i=1;i<points.length;i++){const a=new THREE.Vector3(points[i-1].x,points[i-1].y,points[i-1].z),b=new THREE.Vector3(points[i].x,points[i].y,points[i].z),delta=b.clone().sub(a),length=delta.length();if(length<.001)continue;
   const m=mesh(new THREE.CylinderGeometry(radius,radius,length,6),color,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  }
 }
 for(const r of data.routes){tube(r.points,r.kind==='tray'?'#7b918b':'#bf9637',r.kind==='tray'?.035:.014,routes);
  // Individual conductor colours are shown alongside the conduit.
  r.wires.slice(0,6).forEach((w,i)=>tube(r.points.map(p=>({...p,x:p.x+(i+1)*.012})),w.color||'#d8aa41',.004,routes));
 }
 for(const item of data.furnishings||[]){
  const group=new THREE.Group(),{x,z}=item.position,w=item.width,d=item.depth,h=Math.max(.015,item.height),color=item.color||'#c5b59b';group.position.set(x,(item.baseElevation||0)+(item.elevation||0)/100,z);group.rotation.y=-item.rotation*Math.PI/180;(item.layer==='terrain'?terrainGroup:item.layer==='structure'?structureGroup:item.layer==='roof'?roofGroup:furnishingGroup).add(group);
  if(item.layer==='terrain'){box(w,.015,d,0,-.12,0,color,group,.35);}
  else if(item.type==='roofPlane'){const slope=(item.slope||0)/100;const plane=box(w,.08,d*Math.sqrt(1+slope*slope),0,d*slope/2,0,color,group);plane.rotation.x=-Math.atan(slope);}
  else if(['tree','shrub','indoorPlant'].includes(item.type)){const trunk=mesh(new THREE.CylinderGeometry(w*.04,w*.06,h*.5,8),'#8e7356',group);trunk.position.y=h*.25;const crown=mesh(new THREE.SphereGeometry(1,16,12),color,group);crown.scale.set(w/2,h*.38,d/2);crown.position.y=h*.62;}
  else if(['floorLamp','pendant','gardenLamp'].includes(item.type)){box(.025,h,.025,0,h/2,0,'#536a62',group);const shade=mesh(new THREE.SphereGeometry(1,12,8),'#f7e6b4',group);shade.scale.set(w/2,Math.min(.2,h*.2),d/2);shade.position.y=h;}
  else if(['table','desk','island'].includes(item.type)){box(w,.07,d,0,h-.035,0,color,group);for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35])box(.06,h-.07,.06,x,(h-.07)/2,z,'#8e806c',group);}
  else if(['sofa','armchair'].includes(item.type)){box(w,h*.55,d,0,h*.275,0,color,group);box(w,h*.45,d*.2,0,h*.775,-d*.4,color,group);for(const x of [-w*.45,w*.45])box(w*.1,h*.35,d,x,h*.6,0,color,group);}
  else if(['bed','singleBed'].includes(item.type)){box(w,h,d,0,h/2,0,color,group);box(w*.8,.08,d*.2,0,h+.04,-d*.32,'#e6e2d5',group);}
  else box(w,h,d,0,h/2,0,item.type==='tv'?'#314751':item.type==='pond'?'#9acdd8':color,group);
 }
 let camera,controls,width=1,height=1,disposed=false;
 function render(){if(!disposed&&camera)renderer.render(scene,camera);}
 function projection(mode){
  const old=camera,previousTarget=controls?.target.clone()||center.clone();controls?.dispose();
  camera=mode==='orthographic'?new THREE.OrthographicCamera(-span,span,span,-span,.01,span*100):new THREE.PerspectiveCamera(45,width/height,.01,span*100);
  if(old)camera.position.copy(old.position);else camera.position.copy(center).add(new THREE.Vector3(span*.8,span*.85,span));
  controls=new OrbitControls(camera,canvas);controls.target.copy(previousTarget);controls.minDistance=.2;controls.maxDistance=span*15;controls.maxPolarAngle=Math.PI-.05;controls.minZoom=.1;controls.maxZoom=30;controls.addEventListener('change',render);resize();controls.update();render();
 }
 function resize(){width=Math.max(1,host.clientWidth);height=Math.max(1,host.clientHeight);renderer.setSize(width,height);if(camera?.isPerspectiveCamera)camera.aspect=width/height;else if(camera){const half=span*.95;camera.left=-half*width/height;camera.right=half*width/height;camera.top=half;camera.bottom=-half;}camera?.updateProjectionMatrix();render();}
 function fit(){const aspect=width/height,radius=Math.max(.5,Math.hypot(maxX-minX,maxY-minY,maxZ-minZ)/2),angle=Math.atan(Math.tan(Math.PI/8)*Math.min(1,aspect)),dist=radius/Math.sin(angle)*1.1;controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(.6,.7,.85).normalize().multiplyScalar(dist));camera.zoom=1;camera.updateProjectionMatrix();controls.update();render();}
 function view(kind){const target=controls.target,distance=camera.position.distanceTo(target);camera.position.copy(target).add(kind==='top'?new THREE.Vector3(0,distance,.001):kind==='bottom'?new THREE.Vector3(0,-distance,.001):new THREE.Vector3(0,.001,distance));controls.update();render();}
 function zoom(factor){if(camera.isOrthographicCamera){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.1,30);camera.updateProjectionMatrix();}else camera.position.sub(controls.target).multiplyScalar(1/factor).clampLength(.2,span*15).add(controls.target);controls.update();render();}
 function move(dx,dz){const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;if(forward.length()<.001)forward.set(0,0,-1);forward.normalize();const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0));const delta=forward.multiplyScalar(dz*span*.025).add(right.multiplyScalar(dx*span*.025));camera.position.add(delta);controls.target.add(delta);controls.update();render();}
 function save(){render();return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Imagem indisponível.')),'image/png'));}
 const observer=new ResizeObserver(resize);observer.observe(host);
 const focus=()=>canvas.focus();canvas.addEventListener('pointerdown',focus);
 const contextLost=e=>{e.preventDefault();onError('A visualização 3D perdeu a conexão gráfica. Volte à planta e abra a aba 3D novamente.');};canvas.addEventListener('webglcontextlost',contextLost);
 projection('perspective');fit();
 return {projection,fit,view,zoom,move,save,focus,
  layers(options){terrainGroup.visible=options.terrain===true;structureGroup.visible=options.structure!==false;roofGroup.visible=options.roof===true;furnishingGroup.visible=options.furniture!==false;walls.visible=options.walls;devices.visible=options.devices;routes.visible=options.routes;labels.visible=options.labels;walls.traverse(o=>{if(o.isMesh){o.userData.originalMaterial??=o.material;const original=o.userData.originalMaterial;o.material=options.transparent?material(original.color.getStyle(),.24):original;}});render();},
  dispose(){disposed=true;observer.disconnect();controls.dispose();canvas.removeEventListener('pointerdown',focus);canvas.removeEventListener('webglcontextlost',contextLost);root.traverse(o=>{o.geometry?.dispose();if(o.isSprite){o.material.map?.dispose();o.material.dispose();}});materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();}
 };
}
