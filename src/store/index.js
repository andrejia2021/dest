import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    workspace: "",
  },
  mutations: {
    setWorkSpace(state, path) {
      state.workspace = path;
    },
  },
  actions: {},
  modules: {},
});
