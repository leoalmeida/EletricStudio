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
 root.add(walls,devices,routes,labels);scene.add(root);
 const materials=new Map();
 function material(color,opacity=1){const key=color+':'+opacity;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.85,transparent:opacity<1,opacity,side:THREE.DoubleSide}));return materials.get(key);}
 function mesh(geometry,color,parent= root,opacity=1){const m=new THREE.Mesh(geometry,material(color,opacity));parent.add(m);return m;}
 function box(w,h,d,x,y,z,color,parent=root,opacity=1){const m=mesh(new THREE.BoxGeometry(w,h,d),color,parent,opacity);m.position.set(x,y,z);return m;}
 for(const room of data.rooms){const shape=new THREE.Shape(room.points.map(p=>new THREE.Vector2(p.x,-p.z)));const m=mesh(new THREE.ShapeGeometry(shape),'#fafaf5');m.rotation.x=-Math.PI/2;m.position.y=.005;}
 const {minX,maxX,minZ,maxZ}=data.bounds,cx=(minX+maxX)/2,cz=(minZ+maxZ)/2;
 const span=Math.max(maxX-minX,maxZ-minZ,4),center=new THREE.Vector3(cx,data.ceiling*.35,cz);
 if(data.rooms.length===0)box(Math.max(1,maxX-minX)+.5,.04,Math.max(1,maxZ-minZ)+.5,cx,-.025,cz,'#f5f5ee');
 const grid=new THREE.GridHelper(Math.ceil(span+8),Math.ceil(span+8),0xc7d6d0,0xd9e2de);grid.position.set(cx,-.06,cz);root.add(grid);
 for(const wall of data.walls){
  const group=new THREE.Group();group.position.set(wall.a.x,0,wall.a.z);group.rotation.y=-Math.atan2(wall.b.z-wall.a.z,wall.b.x-wall.a.x);walls.add(group);
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
  if(!text)return;const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');ctx.font='500 32px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillRect(0,0,512,80);ctx.fillStyle='#274c45';ctx.fillText(text.slice(0,35),256,52);
  const texture=new THREE.CanvasTexture(c),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(1.5,.235,1);sprite.position.copy(position);labels.add(sprite);
 }
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
 let camera,controls,width=1,height=1,disposed=false;
 function render(){if(!disposed&&camera)renderer.render(scene,camera);}
 function projection(mode){
  const old=camera,previousTarget=controls?.target.clone()||center.clone();controls?.dispose();
  camera=mode==='orthographic'?new THREE.OrthographicCamera(-span,span,span,-span,.01,span*100):new THREE.PerspectiveCamera(45,width/height,.01,span*100);
  if(old)camera.position.copy(old.position);else camera.position.copy(center).add(new THREE.Vector3(span*.8,span*.85,span));
  controls=new OrbitControls(camera,canvas);controls.target.copy(previousTarget);controls.minDistance=.2;controls.maxDistance=span*15;controls.maxPolarAngle=Math.PI-.05;controls.minZoom=.1;controls.maxZoom=30;controls.addEventListener('change',render);resize();controls.update();render();
 }
 function resize(){width=Math.max(1,host.clientWidth);height=Math.max(1,host.clientHeight);renderer.setSize(width,height);if(camera?.isPerspectiveCamera)camera.aspect=width/height;else if(camera){const half=span*.78;camera.left=-half*width/height;camera.right=half*width/height;camera.top=half;camera.bottom=-half;}camera?.updateProjectionMatrix();render();}
 function fit(){const aspect=width/height,dist=span*1.6/Math.min(1,aspect);controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(.6,.7,.85).normalize().multiplyScalar(dist));camera.zoom=1;camera.updateProjectionMatrix();controls.update();render();}
 function view(kind){const target=controls.target,distance=camera.position.distanceTo(target);camera.position.copy(target).add(kind==='top'?new THREE.Vector3(0,distance,.001):kind==='bottom'?new THREE.Vector3(0,-distance,.001):new THREE.Vector3(0,.001,distance));controls.update();render();}
 function zoom(factor){if(camera.isOrthographicCamera){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.1,30);camera.updateProjectionMatrix();}else camera.position.sub(controls.target).multiplyScalar(1/factor).clampLength(.2,span*15).add(controls.target);controls.update();render();}
 function move(dx,dz){const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;if(forward.length()<.001)forward.set(0,0,-1);forward.normalize();const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0));const delta=forward.multiplyScalar(dz*span*.025).add(right.multiplyScalar(dx*span*.025));camera.position.add(delta);controls.target.add(delta);controls.update();render();}
 function save(){render();return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Imagem indisponível.')),'image/png'));}
 const observer=new ResizeObserver(resize);observer.observe(host);
 const focus=()=>canvas.focus();canvas.addEventListener('pointerdown',focus);
 const contextLost=e=>{e.preventDefault();onError('A visualização 3D perdeu a conexão gráfica. Volte à planta e abra a aba 3D novamente.');};canvas.addEventListener('webglcontextlost',contextLost);
 projection('perspective');fit();
 return {projection,fit,view,zoom,move,save,focus,
  layers(options){walls.visible=options.walls;devices.visible=options.devices;routes.visible=options.routes;labels.visible=options.labels;walls.traverse(o=>{if(o.isMesh){o.userData.originalMaterial??=o.material;const original=o.userData.originalMaterial;o.material=options.transparent?material(original.color.getStyle(),.24):original;}});render();},
  dispose(){disposed=true;observer.disconnect();controls.dispose();canvas.removeEventListener('pointerdown',focus);canvas.removeEventListener('webglcontextlost',contextLost);root.traverse(o=>{o.geometry?.dispose();if(o.isSprite){o.material.map?.dispose();o.material.dispose();}});materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();}
 };
}
