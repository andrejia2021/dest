import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

Vue.config.productionTip = false;

const vue = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

const ipcRenderer = require("electron").ipcRenderer;
let app = vue.$children[0];
ipcRenderer.on("setworkspace", function (event, arg) {
  app.$data.workspace = arg;
  app.$data.projects.splice(0, app.$data.projects.length);
  ipcRenderer.send("initprojects", arg);
});

ipcRenderer.on("initprojects", function (event, project) {
  if (!project.files) {
    project.files = new Array();
  }
  app.$data.projects.push(project);
});

ipcRenderer.on("savechanges", function (event, arg) {
  if (app.$data.workspace && app.$data.projects) {
    app.$data.projects.forEach((project, pindex) => {
      const configPath = `${app.$data.workspace}/${project.project}/dest.config.json`;
      ipcRenderer.send("savechanges", configPath, JSON.stringify(project));
    });
    ipcRenderer.send("message", "Save changes successful!");
  }
});
