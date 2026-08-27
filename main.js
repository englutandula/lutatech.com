const { app, BrowserWindow, nativeTheme, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let pythonProcess;

function getPythonExecutable(backendPath) {
  const isWin = process.platform === 'win32';
  
  // 1. Check local backend venv
  const localVenv = isWin 
    ? path.join(backendPath, 'venv', 'Scripts', 'python.exe')
    : path.join(backendPath, 'venv', 'bin', 'python');
  if (fs.existsSync(localVenv)) return localVenv;

  // 2. Check sibling dev venv
  const siblingVenv = isWin
    ? path.join(__dirname, '..', 'backend', 'venv', 'Scripts', 'python.exe')
    : path.join(__dirname, '..', 'backend', 'venv', 'bin', 'python');
  if (fs.existsSync(siblingVenv)) return siblingVenv;

  // 3. System Python fallback
  return isWin ? 'python' : 'python3';
}

function startPythonBackend() {
  const backendPath = path.join(__dirname, 'backend');
  const pythonExecutable = getPythonExecutable(backendPath);
  
  pythonProcess = spawn(pythonExecutable, ['-m', 'uvicorn', 'app.main:app', '--port', '8000'], {
    cwd: backendPath
  });

  pythonProcess.stdout.on('data', (data) => console.log(`Python: ${data}`));
  pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data}`));
}

function checkServerReady(url, timeout, callback) {
  const start = Date.now();
  const interval = setInterval(() => {
    http.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        clearInterval(interval);
        callback(true);
      }
    }).on('error', () => {
      if (Date.now() - start > timeout) {
        clearInterval(interval);
        callback(false);
      }
    });
  }, 500);
}

function createWindow() {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    ...(isMac ? {
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 16, y: 14 }
    } : {}),
    webPreferences: {
      nodeIntegration: false
    }
  });

  // Force Dark Mode!
  nativeTheme.themeSource = 'dark';

  // Open external links (e.g. downloads, GitHub releases, payment) in the default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  checkServerReady('http://localhost:8000', 30000, (isReady) => {
    if (isReady) {
      mainWindow.loadURL('http://localhost:8000');
    } else {
      console.error('Python backend failed to start within 30 seconds.');
    }
  });
}

app.whenReady().then(() => {
  startPythonBackend();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
