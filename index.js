const electron = require('electron')
const url = require('url')
const path = require('path')
const fs = require('fs')

const { app, BrowserWindow, ipcMain } = electron

let mainWindow

var isMaximized = false;

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        transparent: false,
        frame: true,
        autoHideMenuBar: true,
        minHeight: 300,
        minWidth: 200,
        icon: __dirname + './icon.ico',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: true,
            contextIsolation: false,
            webviewTag: true,
            webaudio: false
        },
        alwaysOnTop:true,
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //mainWindow.webContents.openDevTools()

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('close', () => {
        const Websocket = require('ws')
        const ws = new Websocket("ws:127.0.0.1:9801")
        ws.addEventListener("open", e => {
            ws.send(JSON.stringify({
                "auth": {
                    "KEY": "15LVM.ts.0,0,1",
                    "NAME": "dLVM-1LS.management=server",
                    "ip": "127.0.0.2",
                    "port": require('./localstorage.json').port
                },
                "removeconnection": true,
                "userid": require('./localstorage.json').id
            }))
        })
        setTimeout(() => {
            fs.writeFileSync("./localstorage.json", `{"serverdata":{ "KEY":"15LVM.ts.0,0,1", "NAME":"dLVM-1LS.management=server" },"port":0 }`)
        }, 10000)
    })

    mainWindow.on('closed', () => {
        setTimeout(() => {
            if (require("./localstorage.json").port != 0) {
                const Websocket = require('ws')
                const ws = new Websocket("ws:127.0.0.1:9801")
                ws.addEventListener("open", e => {
                    ws.send(JSON.stringify({
                        "auth": {
                            "KEY": "15LVM.ts.0,0,1",
                            "NAME": "dLVM-1LS.management=server",
                            "ip": "127.0.0.2",
                            "port": require('./localstorage.json').port
                        },
                        "removeconnection": true,
                        "userid": require('./localstorage.json').id
                    }))
                })
                setTimeout(() => {
                    fs.writeFileSync("./localstorage.json", `{"serverdata":{ "KEY":"15LVM.ts.0,0,1", "NAME":"dLVM-1LS.management=server" },"port":0 }`)
                }, 10000)
            }
        }, 15000)
    })
})

ipcMain.on('close', (evt, arg) => {
    app.quit()
});

var oldPosition = [100, 100];
var oldSize = [841, 600];

ipcMain.on('maximize', (evt, arg) => {
    var window = BrowserWindow.getFocusedWindow();
    if (!isMaximized) {
        oldPosition = window.getPosition();
        oldSize = window.getSize();
        window.maximize();
        isMaximized = true;
    }
    else {
        window.setSize(oldSize[0], oldSize[1]);
        window.setPosition(oldPosition[0], oldPosition[1]);
        isMaximized = false;
    }
});

ipcMain.on('minimize', (evt, arg) => {
    BrowserWindow.getFocusedWindow().minimize()
});