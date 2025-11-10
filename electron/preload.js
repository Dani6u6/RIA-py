import { contextBridge, ipcRenderer } from 'electron';

// Expone APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Llamar a la API de backend (FastAPI en tu caso)
  callBackendAPI: async (endpoint, data) => {
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error calling backend:', error);
      throw error;
    }
  },

  // Seleccionar archivo
  selectFile: () => ipcRenderer.invoke('select-file'),

  // Seleccionar directorio de salida
  selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),

  // Versión de la app
  getAppVersion: () => process.versions.electron
});
