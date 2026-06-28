const { BrowserWindow, app } = require('electron')

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
	})

	win.loadURL('https://solo-leveling-tensai.vercel.app')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
