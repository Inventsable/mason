import Vue from "vue";
import { LocalStorage } from "quasar";

const state = {
  settings: {
    drawAnchors: true,
    anchorSize: 25,
    anchorColor: "#4F80FF",
    anchorStrokeWidth: 5,
    anchorIsFilled: false,
    handleIsFilled: false,
    drawHandles: true,
    handleSize: 35,
    handleColor: "#4F80FF",
    handleStrokeWidth: 5,
    drawSticks: true,
    stickStrokeWidth: 10,
    stickColor: "#4F80FF",
    shy: true,
    locked: true,
    guideLayer: true,
    labelOverride: true,
    useCompBG: true,
    selectionOnly: false
  }
};

const mutations = {
  setAnchorIsFilled(state, value) {
    state.settings.anchorIsFilled = value;
  },
  setAnchorColor(state, value) {
    state.settings.anchorColor = value;
  },
  setAnchorSize(state, value) {
    state.settings.anchorSize = value;
  },
  setAnchorStrokeWidth(state, value) {
    state.settings.anchorStrokeWidth = value;
  },
  setHandleIsFilled(state, value) {
    state.settings.handleIsFilled = value;
  },
  setHandleColor(state, value) {
    state.settings.handleColor = value;
  },
  setHandleSize(state, value) {
    state.settings.handleSize = value;
  },
  setHandleStrokeWidth(state, value) {
    state.settings.handleStrokeWidth = value;
  },
  setStickColor(state, value) {
    state.settings.stickColor = value;
  },
  setStickStrokeWidth(state, value) {
    state.settings.stickStrokeWidth = value;
  },
  setShy(state, value) {
    state.settings.shy = value;
  },
  setLocked(state, value) {
    state.settings.locked = value;
  },
  setLabelOverride(state, value) {
    state.settings.labelOverride = value;
  },
  setGuideLayer(state, value) {
    state.settings.guideLayer = value;
  },
  setDrawAnchors(state, value) {
    state.settings.drawAnchors = value;
  },
  setDrawHandles(state, value) {
    state.settings.drawHandles = value;
  },
  setDrawSticks(state, value) {
    state.settings.drawSticks = value;
  },
  setSelectionOnly(state, value) {
    state.settings.selectionOnly = value;
  },
  setUseCompBG(state, value) {
    state.settings.useCompBG = value;
  },
  setSettings(state, value) {
    Object.assign(state.settings, value);
  }
};

const actions = {
  setAnchorSize({ commit, dispatch }, value) {
    commit("setAnchorSize", value);
    dispatch("saveSettings");
  },
  setAnchorColor({ commit, dispatch }, value) {
    commit("setAnchorColor", value);
    dispatch("saveSettings");
  },
  setAnchorStrokeWidth({ commit, dispatch }, value) {
    commit("setAnchorStrokeWidth", value);
    dispatch("saveSettings");
  },
  setAnchorIsFilled({ commit, dispatch }, value) {
    commit("setAnchorIsFilled", value);
    dispatch("saveSettings");
  },
  setHandleIsFilled({ commit, dispatch }, value) {
    commit("setHandleIsFilled", value);
    dispatch("saveSettings");
  },
  setHandleSize({ commit, dispatch }, value) {
    commit("setHandleSize", value);
    dispatch("saveSettings");
  },
  setHandleStrokeWidth({ commit, dispatch }, value) {
    commit("setHandleStrokeWidth", value);
    dispatch("saveSettings");
  },
  setHandleColor({ commit, dispatch }, value) {
    commit("setHandleColor", value);
    dispatch("saveSettings");
  },
  setStickStrokeWidth({ commit, dispatch }, value) {
    commit("setStickStrokeWidth", value);
    dispatch("saveSettings");
  },
  setStickColor({ commit, dispatch }, value) {
    commit("setStickColor", value);
    dispatch("saveSettings");
  },
  setDrawAnchors({ commit, dispatch }, value) {
    commit("setDrawAnchors", value);
    dispatch("saveSettings");
  },
  setDrawHandles({ commit, dispatch }, value) {
    commit("setDrawHandles", value);
    dispatch("saveSettings");
  },
  setDrawSticks({ commit, dispatch }, value) {
    commit("setDrawSticks", value);
    dispatch("saveSettings");
  },
  setShy({ commit, dispatch }, value) {
    commit("setShy", value);
    dispatch("saveSettings");
  },
  setLabelOverride({ commit, dispatch }, value) {
    commit("setLabelOverride", value);
    dispatch("saveSettings");
  },
  setLocked({ commit, dispatch }, value) {
    commit("setLocked", value);
    dispatch("saveSettings");
  },
  setGuideLayer({ commit, dispatch }, value) {
    commit("setGuideLayer", value);
    dispatch("saveSettings");
  },
  setSelectionOnly({ commit, dispatch }, value) {
    commit("setSelectionOnly", value);
    dispatch("saveSettings");
  },
  setUseCompBG({ commit, dispatch }, value) {
    commit("setUseCompBG", value);
    dispatch("saveSettings");
  },
  getSettings({ commit }) {
    let settings = LocalStorage.getItem("settings");
    if (settings) commit("setSettings", settings);
  },
  saveSettings({ state }) {
    LocalStorage.set("settings", state.settings);
  }
};

const getters = {
  settings: state => {
    return state.settings;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
