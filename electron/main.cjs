const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
	const win = new BrowserWindow({
		frame: false,
		show: true,
		icon: path.join(__dirname, 'favicon.ico'),
	})

	win.loadURL('https://solo-leveling-tensai.vercel.app')

	win.maximize() // fills screen but keeps OS behavior
	return win
}

app.whenReady().then(createWindow)
