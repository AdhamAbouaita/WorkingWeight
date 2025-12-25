const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Data File Path
// Saved directly in user's home folder as requested
const DATA_FILE = path.join(os.homedir(), 'working_weight.csv');

// Helper to ensure CSV exists
function ensureDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const headers = 'date,exercise_name,weight\n';
        try {
            fs.writeFileSync(DATA_FILE, headers, 'utf8');
            console.log('Created new data file at:', DATA_FILE);
        } catch (err) {
            console.error('Error creating data file:', err);
        }
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#1a1a1a', // Dark theme bg
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false // needed for some file access patterns if strict
        }
    });

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools(); // Uncomment for debugging
}

app.whenReady().then(() => {
    ensureDataFile();
    createWindow();

    // IPC Handlers
    ipcMain.handle('data:get', async () => {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return { success: true, data };
        } catch (error) {
            console.error('Error reading file:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('data:save', async (event, entry) => {
        // entry: { date, exercise, weight }
        // Minimal validation
        if (!entry.date || !entry.exercise || !entry.weight) {
            return { success: false, error: 'Invalid data' };
        }

        // CSV Line: date,exercise,weight
        // Escape commas in exercise name just in case? Simple approach for now.
        const csvLine = `${entry.date},${entry.exercise.replace(/,/g, '')},${entry.weight}\n`;

        try {
            fs.appendFileSync(DATA_FILE, csvLine, 'utf8');
            return { success: true };
        } catch (error) {
            console.error('Error appending file:', error);
            return { success: false, error: error.message };
        }
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
