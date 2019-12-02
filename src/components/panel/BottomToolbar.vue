<template>
  <q-footer id="bottombar">
    <q-bar class="q-pa-md">
      <div class="q-mx-sm">
        <q-btn dense flat @click="makeSelected" icon="mdi-cursor-default">
          <tooltipper nudge="right" msg="Select all" />
        </q-btn>
      </div>
      <div class="q-mx-sm">
        <q-btn dense flat @click="toggleVisible" icon="mdi-eye">
          <tooltipper msg="Toggle visibility" />
        </q-btn>
      </div>
      <div class="q-mx-sm">
        <q-btn dense flat @click="toggleLocked" icon="mdi-lock">
          <tooltipper msg="Toggle lock" />
        </q-btn>
      </div>
      <div class="q-mx-sm">
        <q-btn dense flat @click="toggleShy" icon="mdi-magnify-close">
          <tooltipper msg="Toggle shy" />
        </q-btn>
      </div>
      <div class="q-mx-sm">
        <q-btn dense flat @click="toggleGuides" icon="mdi-pound-box">
          <tooltipper msg="Toggle guides" />
        </q-btn>
      </div>
      <q-space></q-space>
      <q-btn dense flat @click="deleteAll" icon="mdi-delete">
        <tooltipper nudge="left" msg="Delete all" />
      </q-btn>
    </q-bar>
  </q-footer>
</template>

<script>
import { evalScript } from "cluecumber";

export default {
  components: {
    tooltipper: require("components/panel/tooltipper.vue").default
  },
  methods: {
    isActiveStyle(state) {
      return `
        color: var(--color-${state ? "selection" : "default"});
      `;
    },
    async makeVisible() {
      await evalScript(
        `toggleAllAttribute('enabled', ${JSON.stringify(true)})`
      );
    },
    async toggleVisible() {
      await evalScript(
        `toggleAllAttribute('enabled', ${JSON.stringify(false)})`
      );
    },
    async makeLocked() {
      await evalScript(`toggleAllLock(${JSON.stringify(true)})`);
    },
    async toggleLocked() {
      await evalScript(`toggleAllLock(${JSON.stringify(false)})`);
    },
    async makeGuides() {
      await evalScript(
        `toggleAllAttribute('guideLayer', ${JSON.stringify(true)})`
      );
    },
    async toggleGuides() {
      await evalScript(
        `toggleAllAttribute('guideLayer', ${JSON.stringify(false)})`
      );
    },
    async makeShy() {
      await evalScript(`toggleAllAttribute('shy', ${JSON.stringify(true)})`);
    },
    async toggleShy() {
      await evalScript(`toggleAllAttribute('shy', ${JSON.stringify(false)})`);
    },
    async makeSelected() {
      await evalScript(
        `toggleAllAttribute('selected', ${JSON.stringify(true)})`
      );
    },
    async toggleSelected() {
      await evalScript(
        `toggleAllAttribute('selected', ${JSON.stringify(false)})`
      );
    },
    async deleteAll() {
      await evalScript("scrubAll()");
    }
  }
};
</script>

<style>
#bottombar {
  min-width: 350px;
}
</style>
