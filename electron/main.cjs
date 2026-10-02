const { app, BrowserWindow, protocol, net, session, Menu } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'tefsir',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
])

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 800,
    minHeight: 600,
    title: 'Tefsir Es-Saadi',
    backgroundColor: '#f5f8fc',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event) => event.preventDefault())
  window.loadURL('tefsir://app/index.html')
}

app.whenReady().then(() => {
  const root = path.join(app.getAppPath(), 'dist')
  protocol.handle('tefsir', (request) => {
    const url = new URL(request.url)
    if (url.host !== 'app' || request.method !== 'GET')
      return new Response('Forbidden', { status: 403 })
    let pathname
    try {
      pathname = decodeURIComponent(url.pathname)
    } catch {
      return new Response('Bad request', { status: 400 })
    }
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
    if (!target.startsWith(root + path.sep)) return new Response('Forbidden', { status: 403 })
    return net.fetch(pathToFileURL(target).toString())
  })
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) =>
    callback(false),
  )
  session.defaultSession.setPermissionCheckHandler(() => false)
  Menu.setApplicationMenu(null)
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
