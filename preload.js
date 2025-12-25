const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getData: () => ipcRenderer.invoke('data:get'),
    saveData: (entry) => ipcRenderer.invoke('data:save', entry)
});
