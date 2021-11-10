const { exec } = require("child_process");
const { Notification } = require("electron");

export function exerTerminal(exerText) {
  exec(exerText, (error, stdout, stderr) => {
    if (error) {
      new Notification({
        title: "DEST Message",
        body: error.message,
      }).show();
      console.log(`[ERROR] openCashDrawer: ${error.message}`);
      return;
    }
    if (stderr) {
      new Notification({
        title: "DEST Message",
        body: stderr,
      }).show();
      console.log(`[STDERROR] openCashDrawer: ${stderr}`);
      return;
    }
    console.log(`openCashDrawer: ${stdout}`); // Output response from the terminal
  });
}
