<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <q-bar>
        <q-space />
        <q-tabs v-model="activeTab" shrink stretch>
          <q-route-tab
            v-for="(tab, i) in tabs"
            :key="i"
            :icon="tab.icon"
            :to="tab.route"
          />
        </q-tabs>
      </q-bar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
    <bottom-toolbar />
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import getExtVersion from "src/utils/main/getExtVersion";

export default {
  name: "MyLayout",
  components: {
    drawer: require("components/panel/Drawer.vue").default,
    tooltipper: require("components/panel/tooltipper.vue").default,
    "bottom-toolbar": require("components/panel/BottomToolbar").default
  },
  data: () => ({
    activeTab: "Home",
    tabs: [
      {
        label: "Home",
        route: "/",
        icon: "home"
      },
      {
        label: "Config",
        route: "/config",
        icon: "mdi-settings"
      }
    ]
  }),
  mounted() {
    console.log("Panel");
  },
  computed: {
    ...mapGetters("settings", ["settings"]),
    app() {
      return this.$root.$children[0];
    },
    extVersion() {
      return getExtVersion();
    },
    size: {
      get() {
        return this.settings.size;
      },
      set(value) {
        this.setSize(value);
      }
    }
  },
  methods: {
    ...mapActions("settings", ["setSize"]),

    isActiveStyle(state) {
      return `
        color: var(--color-${state ? "selection" : "default"});
      `;
    }
  }
};
</script>

<style>
.q-layout__section--marginal {
  user-select: none;
  cursor: default;
  background-color: var(--color-bg);
}

.q-tab {
  min-height: 32px;
  max-height: 32px;
}

.q-bar {
  background: var(--color-bg);
}

@media screen and (max-width: 260px) {
  .toolbar-title {
    display: none;
  }
}
</style>
