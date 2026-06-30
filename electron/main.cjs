const { app, BrowserWindow } = require('electron')
const path = require('path')
function createWindow() {
	const win = new BrowserWindow({
		frame: false,
		show: false,
		backgroundColor: '#02080f',
		icon: path.join(__dirname, 'favicon.ico'),
	})
	win.loadURL('https://solo-leveling-tensai.vercel.app')
	win.maximize() // fills screen but keeps OS behavior
	win.setFullScreen(true)
	return win
}
app.whenReady().then(createWindow)
