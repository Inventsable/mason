<template>
  <q-page>
    <div class="">
      <q-list id="config">
        <!-- <q-item-label header>General</q-item-label> -->
        <q-item dense tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="shy" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              shy ? "Always set layers as shy" : "Don't set layers as shy"
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item dense tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="guideLayer" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              guideLayer
                ? "Always set layers as guides"
                : "Don't set layers as guides"
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="labelOverride" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              labelOverride ? "Label override on" : "Label override off"
            }}</q-item-label>
            <q-item-label caption>{{
              labelOverride
                ? `Use the parent's layer label color for all fills and strokes`
                : `Color anchors, handles and sticks individually`
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="useCompBG" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              useCompBG ? "Use comp background" : "Don't use comp background"
            }}</q-item-label>
            <q-item-label caption>{{
              useCompBG
                ? `Use a fill/stroke the same color as comp BG to feather edges`
                : `Don't generate an alternate fill/stroke`
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <!-- ANCHORS -->
        <q-item-label header>Anchors</q-item-label>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="drawAnchors" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              drawAnchors ? "Enabled" : "Disabled"
            }}</q-item-label>
            <q-item-label caption>{{
              drawAnchors
                ? `Create anchors for every vertex`
                : `Don't create anchors`
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <div v-if="drawAnchors">
          <q-item tag="label" v-ripple>
            <q-item-section avatar top>
              <q-checkbox v-model="anchorIsFilled" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Filled</q-item-label>
              <q-item-label caption
                >Anchors have a
                {{ anchorIsFilled ? "Fill" : "Stroke" }}</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section style="max-width: 70px" class="q-mx-md">
              <q-input
                label="Size"
                v-model.number="anchorSize"
                type="number"
                suffix="px"
              />
            </q-item-section>
            <q-item-section style="max-width: 70px" class="q-mx-md">
              <q-input
                label="Stroke Width"
                v-model.number="anchorStrokeWidth"
                type="number"
                suffix="px"
              />
            </q-item-section>
            <q-item-section style="max-width: 120px" class="q-mx-sm">
              <tooltipper v-if="labelOverride" msg="Label override is on" />
              <q-input
                v-model="anchorColor"
                spellcheck="false"
                hide-bottom-space
                :disable="labelOverride"
                label="Anchor color"
                class="my-input"
              >
                <template v-slot:after>
                  <q-btn
                    :disabled="labelOverride"
                    icon="colorize"
                    dense
                    flat
                    style="margin-top: 10px;"
                  >
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-color
                        dark
                        :value="anchorColor"
                        @change="
                          val => {
                            anchorColor = val;
                          }
                        "
                      />
                    </q-popup-proxy>
                  </q-btn>
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </div>
        <q-separator class="q-mt-sm" />
        <!-- HANDLES -->
        <q-item-label header>Handles</q-item-label>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="drawHandles" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Enabled</q-item-label>
            <q-item-label caption>{{
              drawHandles
                ? `Create handles for every Bezier curve`
                : `Don't create handles`
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <div v-if="drawHandles">
          <q-item tag="label" v-ripple>
            <q-item-section avatar top>
              <q-checkbox v-model="handleIsFilled" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Filled</q-item-label>
              <q-item-label caption
                >Handles have a
                {{ handleIsFilled ? "Fill" : "Stroke" }}</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section style="max-width: 70px" class="q-mx-md">
              <q-input
                label="Size"
                v-model.number="handleSize"
                type="number"
                suffix="px"
              />
            </q-item-section>
            <q-item-section style="max-width: 70px" class="q-mx-md">
              <q-input
                label="Stroke Width"
                v-model.number="handleStrokeWidth"
                type="number"
                suffix="px"
              />
            </q-item-section>
            <q-item-section style="max-width: 120px" class="q-mx-sm">
              <tooltipper v-if="labelOverride" msg="Label override is on" />
              <q-input
                v-model="handleColor"
                spellcheck="false"
                hide-bottom-space
                :disable="labelOverride"
                label="Handle color"
                class="my-input"
              >
                <template v-slot:after>
                  <q-btn
                    :disabled="labelOverride"
                    icon="colorize"
                    dense
                    flat
                    style="margin-top: 10px;"
                  >
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-color
                        dark
                        :value="handleColor"
                        @change="
                          val => {
                            handleColor = val;
                          }
                        "
                      />
                    </q-popup-proxy>
                  </q-btn>
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </div>
        <q-separator class="q-mt-sm" />
        <!-- STICKS -->
        <q-item-label header>Sticks</q-item-label>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="drawSticks" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Enabled</q-item-label>
            <q-item-label caption>{{
              drawSticks
                ? `Create sticks for every handle`
                : `Don't create sticks`
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <div v-if="drawSticks">
          <q-item>
            <q-item-section style="max-width: 70px" class="q-mx-md">
              <q-input
                label="Stroke Width"
                v-model.number="stickStrokeWidth"
                type="number"
                suffix="px"
              />
            </q-item-section>
            <q-item-section style="max-width: 120px" class="q-mx-sm">
              <tooltipper v-if="labelOverride" msg="Label override is on" />
              <q-input
                v-model="stickColor"
                spellcheck="false"
                hide-bottom-space
                :disable="labelOverride"
                label="Handle color"
                class="my-input"
              >
                <template v-slot:after>
                  <q-btn
                    :disabled="labelOverride"
                    icon="colorize"
                    dense
                    flat
                    style="margin-top: 10px;"
                  >
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-color
                        dark
                        :value="stickColor"
                        @change="
                          val => {
                            stickColor = val;
                          }
                        "
                      />
                    </q-popup-proxy>
                  </q-btn>
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </div>
        <q-separator class="q-mt-sm" />
        <q-item tag="label">
          <q-item-section>
            <q-btn @click="resetConfig" flat>Reset config to defaults</q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    tooltipper: require("components/panel/tooltipper.vue").default
  },
  data: () => ({
    defaultConfig: {
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
  }),
  computed: {
    ...mapGetters("settings", ["settings"]),
    drawAnchors: {
      get() {
        return this.settings.drawAnchors;
      },
      set(value) {
        this.setDrawAnchors(value);
      }
    },
    anchorSize: {
      get() {
        return this.settings.anchorSize;
      },
      set(value) {
        this.setAnchorSize(value);
      }
    },
    anchorColor: {
      get() {
        return this.settings.anchorColor;
      },
      set(value) {
        this.setAnchorColor(value);
      }
    },
    anchorStrokeWidth: {
      get() {
        return this.settings.anchorStrokeWidth;
      },
      set(value) {
        this.setAnchorStrokeWidth(value);
      }
    },
    anchorIsFilled: {
      get() {
        return this.settings.anchorIsFilled;
      },
      set(value) {
        this.setAnchorIsFilled(value);
      }
    },
    handleIsFilled: {
      get() {
        return this.settings.handleIsFilled;
      },
      set(value) {
        this.setHandleIsFilled(value);
      }
    },
    drawHandles: {
      get() {
        return this.settings.drawHandles;
      },
      set(value) {
        this.setDrawHandles(value);
      }
    },
    handleSize: {
      get() {
        return this.settings.handleSize;
      },
      set(value) {
        this.setHandleSize(value);
      }
    },
    handleColor: {
      get() {
        return this.settings.handleColor;
      },
      set(value) {
        this.setHandleColor(value);
      }
    },
    handleStrokeWidth: {
      get() {
        return this.settings.handleStrokeWidth;
      },
      set(value) {
        this.setHandleStrokeWidth(value);
      }
    },
    drawSticks: {
      get() {
        return this.settings.drawSticks;
      },
      set(value) {
        this.setDrawSticks(value);
      }
    },
    stickStrokeWidth: {
      get() {
        return this.settings.stickStrokeWidth;
      },
      set(value) {
        this.setStickStrokeWidth(value);
      }
    },
    stickColor: {
      get() {
        return this.settings.stickColor;
      },
      set(value) {
        this.setStickColor(value);
      }
    },
    shy: {
      get() {
        return this.settings.shy;
      },
      set(value) {
        this.setShy(value);
      }
    },
    locked: {
      get() {
        return this.settings.locked;
      },
      set(value) {
        this.setLocked(value);
      }
    },
    guideLayer: {
      get() {
        return this.settings.guideLayer;
      },
      set(value) {
        this.setGuideLayer(value);
      }
    },
    labelOverride: {
      get() {
        return this.settings.labelOverride;
      },
      set(value) {
        this.setLabelOverride(value);
      }
    },
    useCompBG: {
      get() {
        return this.settings.useCompBG;
      },
      set(value) {
        this.setUseCompBG(value);
      }
    },
    selectionOnly: {
      get() {
        return this.settings.selectionOnly;
      },
      set(value) {
        this.setSelectionOnly(value);
      }
    }
  },
  methods: {
    ...mapActions("settings", [
      "setAnchorSize",
      "setAnchorColor",
      "setAnchorStrokeWidth",
      "setAnchorIsFilled",
      "setHandleIsFilled",
      "setHandleSize",
      "setHandleStrokeWidth",
      "setHandleColor",
      "setStickStrokeWidth",
      "setStickColor",
      "setDrawAnchors",
      "setDrawHandles",
      "setDrawSticks",
      "setShy",
      "setLabelOverride",
      "setLocked",
      "setGuideLayer",
      "setSelectionOnly",
      "setUseCompBG"
    ]),
    resetConfig() {
      const self = this;
      Object.keys(this.defaultConfig).forEach(key => {
        self[key] = self.defaultConfig[key];
      });
    }
  }
};
</script>

<style>
.q-field__native,
.q-field__prefix,
.q-field__suffix,
.q-field__marginal,
/* .q-field__control, */
.q-field__label {
  color: var(--color-default);
}

.q-checkbox__inner {
  color: var(--color-default);
}

.q-checkbox__inner--active {
  color: var(--q-color-primary);
}

.q-field__focused {
  border-bottom-color: red;
}

.q-field--standard .q-field__control:before {
  border-bottom: 1px solid var(--color-default);
}
.q-field--standard .q-field__control:hover:before {
  border-bottom: 1px solid var(--color-btn-hover);
}

.q-dark {
  background: var(--color-bg);
}

.q-item__label--header {
  user-select: none;
  cursor: default;
  font-size: 1rem;
}

.q-separator {
  background: var(--color-btn-disabled-text);
}
</style>
