/* eslint-disable global-require */
/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import log from 'electron-log';
import getPort from 'get-port';
import { spawn } from 'child_process';
import get from 'axios';
import { Event } from 'electron/renderer';
// import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    autoUpdater.autoDownload = false;
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    // autoUpdater.checkForUpdatesAndNotify();
  }
}

// Remove this if your app does not use auto updates
// eslint-disable-next-line
new AppUpdater();

type BrowserWindowsType = {
  mainWindow: any;
  activationWindow: any;
  updateWindow: any;
};

const browserWindows = <BrowserWindowsType>{};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

//   return Promise.all(
//     extensions.map((name) => installer.default(installer[name], forceDownload))
//   ).catch(console.log);
// };

// Function to shutdown Electron & Flask
const shutdown = (port: number) => {
  get(`http://localhost:${port}/quit`)
    .then(() => app.quit())
    .catch(() => app.quit());
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = async () => {
  // if (
  //   process.env.NODE_ENV === 'development' ||
  //   process.env.DEBUG_PROD === 'true'
  // ) {
  //   await installExtensions();
  // }

  const port = await getPort({
    port: getPort.makeRange(3001, 3999),
  });

  browserWindows.mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    width: 450,
    height: 580,
    resizable: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  });

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    spawn(`python ./src/python/app.py ${port}`, {
      detached: true,
      shell: true,
      stdio: 'inherit',
    });
  } else {
    spawn(`start ./resources/python/app/app.exe ${port}`, {
      detached: false,
      shell: true,
      stdio: 'pipe',
    });
  }

  browserWindows.mainWindow.loadURL(`file://${__dirname}/index.html`);

  browserWindows.mainWindow.webContents.on('did-finish-load', () => {
    if (!browserWindows.mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      browserWindows.mainWindow.minimize();
    } else {
      browserWindows.mainWindow.show();
      browserWindows.mainWindow.focus();
    }
  });

  ipcMain.on('get-port-number', (event) => {
    event.returnValue = port;
  });

  ipcMain.on('hyperlink', (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('close-me', (event, arg) => {
    app.quit();
    shutdown(port);
  });

  browserWindows.mainWindow.on('closed', () => {
    browserWindows.mainWindow = null;
  });

  // if (process.env.NODE_ENV === 'development') {
  //   const menuBuilder = new MenuBuilder(browserWindows.mainWindow);
  //   menuBuilder.buildMenu();
  // }
  // Open urls in the user's browser
  browserWindows.mainWindow.webContents.on(
    'new-window',
    (event: Event, url: string) => {
      event.preventDefault();
      shell.openExternal(url);
    }
  );

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      shutdown(port);
    }
  });
};

const createUpdateWindow = () => {
  browserWindows.updateWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 350,
    height: 400,
    frame: false,
    show: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const loaderConfig = {
    updater: '../assets/loaders/update.html',
  };
  browserWindows.updateWindow.loadFile(
    path.join(__dirname, loaderConfig.updater)
  );
  browserWindows.updateWindow.webContents.on('did-finish-load', () => {
    browserWindows.updateWindow.show();
  });
};

const checkForUpdates = () => {
  const result = autoUpdater.checkForUpdates();
  let updateVersion: string;
  result
    .then((checkResult: UpdateCheckResult) => {
      const { updateInfo } = checkResult;
      updateVersion = updateInfo.version;
      return null;
    })
    .catch(console.log);

  ipcMain.on('new-version', (event) => {
    event.sender.send('new-version', { version: updateVersion });
  });

  autoUpdater.on('update-available', () => {
    createUpdateWindow();
    autoUpdater.downloadUpdate();
  });
  autoUpdater.on('update-not-available', () => {
    createWindow();
  });
  autoUpdater.on('error', () => {
    createWindow();
  });
  // Update download progress event
  autoUpdater.on('download-progress', (progressObj) => {
    browserWindows.updateWindow.webContents.send(
      'downloadProgress',
      progressObj
    );
  });
  // The installation package download is complete
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });
};

/**
 * Add event listeners...
 */

app
  .whenReady()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      createWindow();
    } else {
      checkForUpdates();
    }
    return null;
  })
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (browserWindows.mainWindow === null) createWindow();
});

ipcMain.on('focus-main-window', () => {
  browserWindows.mainWindow.focus();
});

ipcMain.on('create-activation-window', () => {
  browserWindows.activationWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 350,
    height: 400,
    frame: false,
    show: false,
    resizable: false,
    alwaysOnTop: true,
    parent: browserWindows.mainWindow,
  });
  const loaderConfig = {
    activation: '../assets/loaders/activation.html',
  };
  browserWindows.activationWindow.loadFile(
    path.join(__dirname, loaderConfig.activation)
  );
  browserWindows.activationWindow.webContents.on('did-finish-load', () => {
    browserWindows.mainWindow.hide();
    browserWindows.activationWindow.show();
    browserWindows.activationWindow.focus();
  });
});

ipcMain.on('close-activation-window', () => {
  browserWindows.activationWindow.close();
  browserWindows.mainWindow.show();
  browserWindows.mainWindow.setAlwaysOnTop(true);
  setTimeout(() => {
    browserWindows.mainWindow.setAlwaysOnTop(false);
  }, 500);
});

ipcMain.on('app-version', (event) => {
  event.sender.send('app-version', { version: app.getVersion() });
});

ipcMain.on('assets-path', (event) => {
  event.sender.send('assets-path', { assetsPath: getAssetPath() });
});

ipcMain.handle('assets-path', (event, arg) => {
  // do stuff
  const assetsPath = getAssetPath();
  return assetsPath;
});
