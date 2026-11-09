const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
app.setName('Eletric Studio');
if(process.platform==='win32')app.setAppUserModelId('com.eletricstudio.desktop');
const smokeTest=process.argv.includes('--smoke-test');
if(smokeTest){const profile=process.argv.find(a=>a.startsWith('--smoke-profile='));if(!profile)throw Error('Perfil isolado obrigatório.');app.setPath('userData',path.resolve(profile.slice('--smoke-profile='.length)));}
// Acquire the profile lock before Chromium starts its disk caches.
if(!app.requestSingleInstanceLock()){
 app.quit();
}else{
app.on('second-instance',()=>{
 const win=BrowserWindow.getAllWindows()[0];
 if(win){if(win.isMinimized())win.restore();win.show();win.focus();}
});
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:!smokeTest,icon:path.join(__dirname,'../build/resources/icon.png'),titleBarStyle:'hidden',titleBarOverlay:process.platform==='darwin'?undefined:{color:'#1d3c57',symbolColor:'#ffffff',height:42},trafficLightPosition:process.platform==='darwin'?{x:14,y:14}:undefined,width:1500,height:980,minWidth:1000,minHeight:700,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,preload:path.join(__dirname,'preload.cjs')}});
 const {validatePlan}=await import('../src/floor/model.js');
 const pendingFiles=new Set();
 let restarting=false;
 ipcMain.handle('app:restart',async event=>{
  if(event.sender!==win.webContents)throw Error('Janela inválida.');
  if(restarting)return;restarting=true;
  try{await Promise.allSettled([...pendingFiles]);await win.webContents.session.flushStorageData();app.relaunch();setTimeout(()=>app.quit(),100);}
  catch(error){restarting=false;throw error;}
 });
 ipcMain.handle('docs:open',async(event,id)=>{if(event.sender!==win.webContents)throw Error('Janela inválida.');const {documentationById}=await import('../src/floor/utilityDocs.js');const doc=documentationById(id);if(!doc||new URL(doc.url).protocol!=='https:')throw Error('Referência de documentação inválida.');await shell.openExternal(doc.url);return true;});
 const planFiles=require('./plan-files.cjs')({dialog,fs,win,validate:validatePlan});
 const {validate:validateCommand}=await import('../src/model.js');
 const commandFiles=require('./plan-files.cjs')({dialog,fs,win,validate:validateCommand,label:'diagrama',extension:'cade.json',filters:[{name:'Diagrama de comandos',extensions:['cade.json','json']}]});
 for(const [channel,files,method] of [['floor:open-plan',planFiles,'open'],['floor:save-plan',planFiles,'save'],['command:open',commandFiles,'open'],['command:save',commandFiles,'save']])ipcMain.handle(channel,(event,options)=>{if(event.sender!==win.webContents)throw Error('Janela inválida.');if(restarting)throw Error('Aplicação reiniciando.');const action=files[method](options);pendingFiles.add(action);return action.finally(()=>pendingFiles.delete(action));});
 let quitting=false;app.on('before-quit',()=>quitting=true);
 if(process.platform==='darwin'){win.on('close',event=>{if(!quitting){event.preventDefault();win.hide();}});app.on('activate',()=>{win.show();win.focus();});}
 win.removeMenu();
 win.webContents.on('console-message',event=>{if(event.level==='error')console.error('renderer:',event.message);});
 win.webContents.on('render-process-gone',(_event,details)=>console.error('Renderer exited:',details));
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',event=>event.preventDefault());
 ipcMain.handle('floor:export-pdf',async(event,options)=>{
  if(event.sender!==win.webContents||!options||!['A3','A4'].includes(options.paper)||typeof options.landscape!=='boolean'||typeof options.name!=='string')throw Error('Opções de impressão inválidas.');
  const name=options.name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)||'planta';
  const result=await dialog.showSaveDialog(win,{title:'Salvar planta elétrica em PDF',defaultPath:name+'.pdf',filters:[{name:'PDF',extensions:['pdf']}]});
  if(result.canceled||!result.filePath)return {canceled:true};
  const pdf=await win.webContents.printToPDF({printBackground:true,pageSize:options.paper,landscape:options.landscape,preferCSSPageSize:true,displayHeaderFooter:false});
  await fs.writeFile(result.filePath,pdf);return {canceled:false,path:result.filePath};
 });
 try{await win.loadFile(path.join(__dirname,'../dist/index.html'));
 if(smokeTest){let rendered=false;for(let attempt=0;attempt<40&&!rendered;attempt++){rendered=await win.webContents.executeJavaScript("Boolean(document.querySelector('.studio-shell') && (document.querySelector('.floor-app') || document.querySelector('.projects-home')))");if(!rendered)await new Promise(r=>setTimeout(r,100));}if(!rendered)throw Error('Interface empacotada não iniciou.');validatePlan({kind:'cade-floor-plan',version:1,name:'Smoke',author:'',date:'',width:1600,height:1100,objects:[],routes:[],circuits:[],mainRating:null});console.log('DESKTOP_SMOKE_OK');app.exit(0);}
 }catch(error){console.error(error);if(smokeTest)app.exit(1);}
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}
