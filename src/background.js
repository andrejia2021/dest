import { app, protocol, BrowserWindow, ipcMain } from "electron";
const { Menu, Notification, dialog } = require("electron");
import { exerTerminal } from "./common/terminal";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const fixPath = require("fix-path");

const Store = require("electron-store");
const store = new Store();

var fs = require("fs");

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win;
async function createWindow() {
  fixPath();
  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 700,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  let template = [
    {
      label: "DEST",
      submenu: [{ role: "about" }, { role: "quit" }],
    },
    {
      label: "environment",
      submenu: [
        {
          label: "switch to QA",
          click: () => {
            exerTerminal("kubectx gke_select-eng-us-2pqa_us-west1_vm-qa-gke");
            new Notification({
              title: "DEST Message",
              body: "switch QA environment successful!",
            }).show();
          },
        },
        {
          type: "separator",
        },
        {
          label: "switch to DEV",
          click: () => {
            exerTerminal(
              "kubectx gke_xperiences-eng-cn-dev_asia-east2_xpe-dev-gke"
            );
            new Notification({
              title: "DEST Message",
              body: "switch DEV environment successful!",
            }).show();
          },
        },
      ],
    },
    {
      label: "workspace",
      submenu: [
        {
          label: "choose a directory",
          click: () => {
            const res = dialog.showOpenDialogSync({
              properties: ["openDirectory"],
              message: "please choose your workspace directory",
            });
            if (res) {
              win.webContents.send("setworkspace", res[0]);
              store.set("workspace", res[0]);
            }
          },
        },
      ],
    },
    {
      label: "edit",
      submenu: [
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { type: "separator" },
        {
          label: "save changes",
          accelerator: "CmdOrCtrl+s",
          click: () => {
            win.webContents.send("savechanges", true);
          },
        },
        {
          label: "clear storage",
          click: () => {
            store.delete("workspace");
            new Notification({
              title: "DEST Message",
              body: "clear storage successful!",
            }).show();
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

ipcMain.on("initprojects", (e, path) => {
  fs.readdir(path, (e1, dirs) => {
    dirs.forEach((item) => {
      const filepath = path + "/" + item + "/dest.config.json";
      fs.exists(filepath, (isexist) => {
        if (isexist) {
          fs.readFile(filepath, "utf8", (err, data) => {
            e.reply("initprojects", JSON.parse(data));
          });
        }
      });
    });
  });
});

ipcMain.on("savechanges", (e, path, text) => {
  fs.writeFile(path, text, "utf8", (err) => {
    // console.log(err);
  });
});

ipcMain.on("message", (e, message) => {
  new Notification({
    title: "DEST Message",
    body: message,
  }).show();
});

ipcMain.on("getworkspace", (e, message) => {
  if (store.has("workspace")) {
    win.webContents.send("setworkspace", store.get("workspace"));
  }
});

ipcMain.on("modifyOrRestoreChanges", (e, project, ismodify) => {
  project.files.forEach((file) => {
    let filepath = `${store.get("workspace")}/${project.project}/${file.path}`;
    fs.readFile(filepath, "utf8", (err, fileContent) => {
      file.changes.forEach((change) => {
        if (ismodify) {
          fileContent = fileContent.replace(change.from, change.to);
        } else {
          fileContent = fileContent.replace(change.to, change.from);
        }
      });
      fs.writeFile(filepath, fileContent, "utf8", (err) => {
        // console.log(err);
      });
    });
  });
});
