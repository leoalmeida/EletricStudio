import fs from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';
const folder=new URL('./resources/',import.meta.url),source=await fs.readFile(new URL('icon.svg',folder),'utf8');
const sizes=[16,32,48,64,128,256,512,1024],images=new Map(sizes.map(size=>[size,Buffer.from(new Resvg(source,{fitTo:{mode:'width',value:size}}).render().asPng())]));
await fs.writeFile(new URL('icon.png',folder),images.get(1024));
const icoSizes=sizes.filter(s=>s<=256),header=Buffer.alloc(6+16*icoSizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(icoSizes.length,4);let offset=header.length;
for(const [i,size]of icoSizes.entries()){const png=images.get(size),start=6+i*16;header[start]=size===256?0:size;header[start+1]=header[start];header.writeUInt16LE(1,start+4);header.writeUInt16LE(32,start+6);header.writeUInt32LE(png.length,start+8);header.writeUInt32LE(offset,start+12);offset+=png.length;}
await fs.writeFile(new URL('icon.ico',folder),Buffer.concat([header,...icoSizes.map(s=>images.get(s))]));
const types={16:'icp4',32:'icp5',64:'icp6',128:'ic07',256:'ic08',512:'ic09',1024:'ic10'},chunks=Object.entries(types).map(([size,type])=>{const png=images.get(Number(size)),h=Buffer.alloc(8);h.write(type);h.writeUInt32BE(png.length+8,4);return Buffer.concat([h,png]);}),icns=Buffer.alloc(8);icns.write('icns');icns.writeUInt32BE(8+chunks.reduce((s,b)=>s+b.length,0),4);await fs.writeFile(new URL('icon.icns',folder),Buffer.concat([icns,...chunks]));
console.log('Ícones PNG, ICO e ICNS gerados.');
