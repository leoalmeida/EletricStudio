const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
app.setName('Eletric Studio');
// Acquire the profile lock before Chromium starts its disk caches.
if(!app.requestSingleInstanceLock()){
 app.quit();
}else{
app.on('second-instance',()=>{
 const win=BrowserWindow.getAllWindows()[0];
 if(win){if(win.isMinimized())win.restore();win.show();win.focus();}
});
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1500,height:980,minWidth:1000,minHeight:700,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,preload:path.join(__dirname,'preload.cjs')}});
 const {validatePlan}=await import('../src/floor/model.js');
 const pendingFiles=new Set();
 let restarting=false;
 ipcMain.handle('app:restart',async event=>{
  if(event.sender!==win.webContents)throw Error('Janela inválida.');
  if(restarting)return;restarting=true;
  try{await Promise.allSettled([...pendingFiles]);await win.webContents.session.flushStorageData();app.relaunch();setTimeout(()=>app.quit(),100);}
  catch(error){restarting=false;throw error;}
 });
 const planFiles=require('./plan-files.cjs')({dialog,fs,win,validate:validatePlan});
 for(const [channel,method] of [['floor:open-plan','open'],['floor:save-plan','save']])ipcMain.handle(channel,(event,options)=>{if(event.sender!==win.webContents)throw Error('Janela inválida.');if(restarting)throw Error('Aplicação reiniciando.');const action=planFiles[method](options);pendingFiles.add(action);return action.finally(()=>pendingFiles.delete(action));});
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
 win.loadFile(path.join(__dirname,'../dist/index.html')).catch(console.error);
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}
