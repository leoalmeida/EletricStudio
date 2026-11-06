const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('cadeDesktop',{restart:()=>ipcRenderer.invoke('app:restart'),openPlan:()=>ipcRenderer.invoke('floor:open-plan'),savePlan:options=>ipcRenderer.invoke('floor:save-plan',options),exportPDF:options=>ipcRenderer.invoke('floor:export-pdf',options)});
