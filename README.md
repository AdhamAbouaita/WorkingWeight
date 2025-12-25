# WorkingWeight

**WorkingWeight** is a standalone, local-first desktop application designed for weightlifters to track their progressive overload. It allows users to log their "working weight" (the maximum weight used for their working sets) and visualize their strength progression over time.

Built with **Electron**, this application runs natively on macOS and stores all data locally on the user's machine, ensuring privacy and ownership of data.

## 🚀 Features

*   **Log Workouts:** Easily record the Date, Exercise Name, and Working Weight.
*   **Visual Progression:** Interactive line graphs show strength trends over time.
*   **Exercise Filtering:** Switch the chart view to focus on specific exercises (e.g., Bench Press, Squat).
*   **Smart Autocomplete:** Remembers previously entered exercises for quick logging.
*   **Dark Mode:** A modern, sleek dark interface designed for focus.
*   **Local Storage:** Data is saved as a simple `.csv` file in your Home directory. No cloud, no accounts.

## 🏗 Architecture

The application is built using the **Electron** framework, which essentially combines a Node.js backend with a Chromium-based frontend.

### Tech Stack
*   **Runtime:** Electron (Node.js + Chromium)
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript
*   **Visualization:** Chart.js
*   **Storage:** Native Node.js File System (`fs`)

### Core Components
1.  **Main Process (`main.js`):**
    *   The entry point of the application.
    *   Manages the application window lifecycle.
    *   Handles **Inter-Process Communication (IPC)** to securely read and write data to the file system.
    *   Ensures the `working_weight.csv` file exists in the user's Home directory.

2.  **Preload Script (`preload.js`):**
    *   Acts as a security bridge between the Frontend and the Backend.
    *   Exposes a limited `window.api` to the frontend using `contextBridge`, preventing the UI from having direct unrestricted access to Node.js APIs.

3.  **Renderer Process (`renderer.js`, `index.html`, `styles.css`):**
    *   **`index.html`**: The structure of the application.
    *   **`styles.css`**: Custom dark-themed CSS variables and layout.
    *   **`renderer.js`**: Handles user interaction, form submissions, and renders the charts using Chart.js. It calls `window.api.saveData` and `window.api.getData` to talk to the main process.

### Data Storage
Data is stored in a clean, human-readable CSV format at:
`~/working_weight.csv` (Your User Home Directory)

**Schema:**
```csv
date,exercise_name,weight
2023-10-27,Bench Press,225
2023-10-29,Squat,315
```

## 🛠 Building the Application

To turn this project into a standalone macOS Application (`.app`), we use **electron-builder**.

### Prerequisites
*   Node.js installed on your machine.
*   Terminal access.

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Development Mode
To run the app locally during development without building:
```bash
npm start
```

### 3. Build & Compile
To create the standalone `.app` file:

```bash
npm run build
```

This process will:
1.  Package the Electron application.
2.  Optimize the assets.
3.  Inject the icon (`logo.png`).
4.  Output the final artifacts into the `dist/` folder.

**Output Location:**
You will find the compiled application in `dist/mac-arm64/WorkingWeight.app` (for Apple Silicon Macs).

## 📄 License
ISC
