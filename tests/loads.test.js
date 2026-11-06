import {test} from 'node:test';
import assert from 'node:assert/strict';
import {examplePlan,validatePlan} from '../src/floor/model.js';
import {withFloors,addFloor,switchFloor} from '../src/floor/floors.js';
import {loadOverview,loadWorkbookRows} from '../src/floor/loadOverview.js';
import {makeLoadXlsx} from '../src/floor/xlsx.js';

test('demanda usa fatores informados e circuitos bifásicos participam das duas fases',()=>{
 const p=examplePlan();p.circuits[0].demandFactor=.5;
 const d=loadOverview(p);
 assert.equal(d.installedVA,1200);assert.equal(d.demandVA,1050);
 assert.equal(d.phases.A.current,150/127+300/127);
 assert.equal(d.phases.B.current,600/220);assert.equal(d.phases.C.current,600/220);
});
test('ABC equilibrado atribui a mesma corrente às três fases e filtro limita os totais',()=>{
 const p=examplePlan();p.circuits[2].phase='ABC';p.circuits[2].demandFactor=.8;
 const d=loadOverview(p,p.circuits[2].panelId);
 assert.equal(d.rows.length,1);assert.equal(d.installedVA,600);
 for(const phase of ['A','B','C'])assert.equal(d.phases[phase].current,600/(220*Math.sqrt(3))*.8);
});
test('potência e tensão desconhecidas não são tratadas como zero',()=>{
 const p=examplePlan();p.objects.find(o=>o.tag==='L1').power=null;p.circuits[2].voltage=null;
 const d=loadOverview(p);assert.equal(d.installedVA,null);assert.equal(d.demandVA,null);assert.equal(d.knownVA,1100);
 assert.equal(d.phases.A.current,null);assert.equal(d.phases.B.current,null);assert.equal(d.phases.C.current,null);
});
test('circuitos sem fase são identificados sem contaminar totais conhecidos',()=>{
 const p=examplePlan();p.circuits[2].phase='?';const d=loadOverview(p);
 assert.equal(d.unassigned,1);assert.equal(d.phases.B.current,0);assert.equal(d.phases.C.current,0);assert.equal(d.installedVA,1200);
});
test('ramal e fatores persistem no arquivo e ficam independentes em cada pavimento',()=>{
 let p=withFloors(examplePlan());const ground=p.activeFloorId;p.supply={utility:'Rede local',phases:3,phaseSection:16,neutralSection:16,earthSection:16,meterBreaker:63,voltageLabel:'127/220 V'};p.circuits[0].demandFactor=.75;
 p=addFloor(p,'Superior');assert.deepEqual(p.supply,{});
 p=validatePlan(JSON.parse(JSON.stringify(p)));p=switchFloor(p,ground);assert.equal(p.supply.utility,'Rede local');assert.equal(p.circuits[0].demandFactor,.75);
});
test('validação rejeita fator ou propriedades inválidas do ramal',()=>{
 const p=examplePlan();p.circuits[0].demandFactor=1.1;assert.throws(()=>validatePlan(p));delete p.circuits[0].demandFactor;
 p.supply={phases:4};assert.throws(()=>validatePlan(p));p.supply={phaseSection:-2};assert.throws(()=>validatePlan(p));p.supply={utility:'x'.repeat(121)};assert.throws(()=>validatePlan(p));
});
test('XLSX tem pacote íntegro e mantém fórmulas aparentes como texto',()=>{
 const p=examplePlan();p.circuits[0].name='=HYPERLINK("test") & <teste>';const rows=loadWorkbookRows(p),bytes=makeLoadXlsx(rows),v=new DataView(bytes.buffer),dec=new TextDecoder();
 let pos=0,count=0,sheet='';
 while(v.getUint32(pos,true)===0x04034b50){const size=v.getUint32(pos+18,true),nameLength=v.getUint16(pos+26,true),name=dec.decode(bytes.slice(pos+30,pos+30+nameLength)),start=pos+30+nameLength;
  let crc=0xffffffff;for(const b of bytes.slice(start,start+size)){crc^=b;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}assert.equal((crc^0xffffffff)>>>0,v.getUint32(pos+14,true));
  if(name==='xl/worksheets/sheet1.xml')sheet=dec.decode(bytes.slice(start,start+size));pos=start+size;count++;
 }
 assert.equal(count,5);assert.equal(v.getUint32(pos,true),0x02014b50);assert.equal(v.getUint32(bytes.length-22,true),0x06054b50);
 assert.ok(sheet.includes('inlineStr'));assert.ok(sheet.includes('=HYPERLINK(&quot;test&quot;) &amp; &lt;teste&gt;'));assert.ok(!sheet.includes('<f>'));
 assert.equal(v.getUint16(bytes.length-12,true),5);
});
