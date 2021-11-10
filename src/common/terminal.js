const { exec } = require("child_process");

export function exerTerminal(exerText) {
  exec(exerText, (error, stdout, stderr) => {
    if (error) {
      console.log(`[ERROR] openCashDrawer: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`[STDERROR] openCashDrawer: ${stderr}`);
      return;
    }
    console.log(`openCashDrawer: ${stdout}`); // Output response from the terminal
  });
}
