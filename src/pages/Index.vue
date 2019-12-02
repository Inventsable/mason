<template>
  <q-pull-to-refresh style="height: 100%;" @refresh="refresh">
    <q-page>
      <div v-if="shapeData" class="main-page">
        <q-table
          class="my-sticky-header-column-table"
          :data="layerTables"
          :columns="columns"
          flat
          row-key="name"
        />
        <div class="buttonwrap">
          <q-btn color="primary" class="q-ma-sm" flat @click="generateShapes"
            >Generate Receivers</q-btn
          >
          <q-btn
            color="primary"
            :disabled="true"
            class="q-ma-sm"
            flat
            @click="generateShapes"
            >Generate Transmitters</q-btn
          >
        </div>
      </div>
      <div v-else class="absolute-center">
        <div class="buttonwrap">
          <q-btn color="primary" class="q-ma-sm" flat @click="generateShapes"
            >Generate Shapes</q-btn
          >
        </div>
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { evalScript } from "cluecumber";

export default {
  components: {
    "quasar-logo": require("src/assets/quasarLogo.vue").default
  },
  data: () => ({
    shapeData: null,
    compLabels: [
      "#666666",
      "#b53838",
      "#e4d84c",
      "#a9cbc7",
      "#e5bcc9",
      "#a9a9ca",
      "#e7c19e",
      "#b3c7b3",
      "#677de0",
      "#4aa44c",
      "#8e2c9a",
      "#e8900d",
      "#7f452a",
      "#f46dd6",
      "#3da2a5",
      "#a89677",
      "#1e401e"
    ],
    columns: [
      {
        name: "layer",
        required: true,
        label: "Layer Name",
        align: "left",
        field: "parentLayer",
        sortable: true
      },
      {
        name: "path",
        align: "left",
        label: "Path Name",
        field: "name",
        sortable: true
      },
      {
        name: "anchors",
        align: "center",
        label: "Anchors",
        field: "anchorCount",
        sortable: true
      },
      {
        name: "handles",
        align: "center",
        label: "Handles",
        field: "handleCount",
        sortable: true
      },
      {
        name: "sticks",
        align: "center",
        label: "Sticks",
        field: "stickCount",
        sortable: true
      }
    ],
    data: [
      {
        parentLayer: "line",
        name: "line 1",
        anchorCount: 3,
        handleCount: 2,
        stickCount: 2
      }
    ]
  }),
  computed: {
    ...mapGetters("settings", ["settings"]),
    app() {
      return this.$root.$children[0];
    },
    size() {
      return this.settings.size;
    },
    layerTables() {
      // This needs to be redone
      let masterList = [];
      if (!this.shapeData) return null;
      let layerNamesFound = [];
      let layerIndicesFound = [];
      let layerPathsFound = [];
      let layerChainsFound = [];
      this.shapeData.forEach(shape => {
        layerNamesFound.push(shape.parentLayerName);
        layerIndicesFound.push(shape.parentLayerIndex);
        layerPathsFound.push(shape.parentPathName);
        layerChainsFound.push(shape.chain);
      });
      let uniqueNames = [...new Set(layerNamesFound)];
      let uniqueIndices = [...new Set(layerIndicesFound)];
      let uniquePaths = [...new Set(layerPathsFound)];
      let uniqueChains = [...new Set(layerChainsFound)];

      let uniques = {};
      if (uniqueChains.length) {
        uniqueChains.forEach(chain => {
          let children = this.shapeData.filter(item => {
            return arraysEqual(item.chain, chain);
          });
          let name = chain[chain.length - 1];
          uniques[name] = {
            name: name,
            parentLayer: children[0].parentLayerName,
            parentIndex: children[0].parentLayerIndex,
            anchorCount: children.filter(child => {
              return /anchor/i.test(child.type);
            }).length,
            handleCount: children.filter(child => {
              return /tangent/i.test(child.type);
            }).length,
            stickCount: children.filter(child => {
              return /stick/i.test(child.type);
            }).length
          };
        });
      }
      Object.keys(uniques).forEach(unique => {
        masterList.push(uniques[unique]);
      });

      function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
      return masterList;
    },
    friendlyAnchorColor() {
      return this.hexToRGB(this.settings.anchorColor);
    },
    config() {
      let newConfig = {};
      Object.assign(newConfig, this.settings);
      Object.keys(newConfig).forEach(key => {
        if (/color/i.test(key)) newConfig[key] = this.hexToRGB(newConfig[key]);
      });
      newConfig["labels"] = this.compLabels.map(label => {
        return this.hexToRGB(label);
      });
      return JSON.stringify(newConfig);
    }
  },
  async mounted() {
    // console.log(this.friendlyAnchorColor);
  },
  methods: {
    hexToRGB(h) {
      h = /^\#/.test(h) ? h : `#${h}`;
      let vals = [h[1] + h[2], h[3] + h[4], h[5] + h[6]];
      return vals.map(c => {
        return parseInt(c, 16) / 255;
      });
    },
    async refresh(done) {
      await this.scanComp();
      done();
    },
    async scanComp() {
      let result = await evalScript(`scanComp('${this.config}')`, {
        test: "Dosomething"
      });
      result = this.sanitizeScanData(result);
      this.shapeData = this.generateShapeData(result);
      console.log(this.shapeData);
      console.log(this.layerTables);
    },
    async generateShapes() {
      await this.scanComp();
      let sorted = this.sortByNameAndIndex(this.shapeData);
      // This could handle both forms of transmission via param
      await evalScript(
        `createReceivers('${this.config}', '${JSON.stringify(sorted)}')`
      );
      // Travel through layer list and handle last selection bug + locked status
      await evalScript(`handlePostStatus('${this.config}')`);
    },
    generateShapeData(data) {
      let result = [];
      data.forEach(item => {
        item.content.forEach(path => {
          let child = {
            parentLayerName: item.name,
            parentLayerIndex: item.index,
            parentPathName: path.name,
            closed: path.closed,
            chain: this.sanitizeChain(path.chain)
          };
          path.inTangents.forEach((point, i) => {
            let anchor = {};
            anchor["direction"] = "In";
            anchor["type"] = "stick";
            anchor["vertex"] = point;
            anchor["sibling"] = path.anchors[i];
            anchor["index"] = i;
            anchor["name"] = `${path.name}_stick${anchor.direction}[${i}]`;
            Object.assign(anchor, child);
            result.push(anchor);
          });
          path.outTangents.forEach((point, i) => {
            let anchor = {};
            anchor["direction"] = "Out";
            anchor["type"] = "stick";
            anchor["vertex"] = point;
            anchor["sibling"] = path.anchors[i];
            anchor["index"] = i;
            anchor["name"] = `${path.name}_stick${anchor.direction}[${i}]`;
            Object.assign(anchor, child);
            result.push(anchor);
          });
          path.anchors.forEach((point, i) => {
            let anchor = {};
            anchor["type"] = "anchor";
            anchor["vertex"] = point;
            anchor["index"] = i;
            anchor["name"] = `${path.name}_anchor[${i}]`;
            Object.assign(anchor, child);
            result.push(anchor);
          });
          path.inTangents.forEach((point, i) => {
            let anchor = {};
            anchor["direction"] = "In";
            anchor["type"] = "inTangent";
            anchor["vertex"] = point;
            anchor["sibling"] = path.anchors[i];
            anchor["index"] = i;
            anchor["name"] = `${path.name}_in[${i}]`;
            Object.assign(anchor, child);
            result.push(anchor);
          });
          path.outTangents.forEach((point, i) => {
            let anchor = {};
            anchor["direction"] = "Out";
            anchor["type"] = "outTangent";
            anchor["vertex"] = point;
            anchor["sibling"] = path.anchors[i];
            anchor["index"] = i;
            anchor["name"] = `${path.name}_out[${i}]`;
            Object.assign(anchor, child);
            result.push(anchor);
          });
        });
      });
      // let sortedResult = this.sortByNameAndIndex(result);
      return this.removeNullHandlesAndSticks(result.reverse());
    },
    sortByNameAndIndex(data) {
      return data
        .sort((a, b) => {
          if (a.parentLayerName == b.parentLayerName) {
            if (a.parentPathName == b.parentPathName) {
              if (a.index > b.index) return 1;
              else if (a.index < b.index) return -1;
              else {
                if (/stick/.test(a.type)) return 1;
                else if (/handle/.test(a.type)) return -1;
                else if (/anchor/.test(a.type)) return 0;
              }
            } else {
              if (a.parentPathName > b.parentPathName) return 1;
              else if (a.parentPathName == b.parentPathName) return 0;
              else return -1;
            }
          } else {
            if (a.parentLayerName > b.parentLayerName) return 1;
            else if (a.parentLayerName == b.parentLayerName) return 0;
            else return -1;
          }
        })
        .reverse();
    },
    removeNullHandlesAndSticks(data) {
      return data.filter(item => {
        return (
          /anchor/.test(item.type) ||
          (item.vertex[0] !== 0 && item.vertex[1] !== 0)
        );
      });
    },
    sanitizeChain(chain) {
      let depths = chain.filter(entry => {
        return /content/i.test(entry);
      });
      if (depths.length > 1) {
        chain.splice(chain.length - 1, 1);
        chain.splice(0, 2);
        chain = chain.filter(entry => {
          return !/content/i.test(entry);
        });
      } else {
        chain = [];
      }
      return chain;
    },
    sanitizeScanData(data) {
      return data.filter(item => {
        return item.content.length;
      });
    }
    // async evalScript(text, defs = {}) {
    //   if (window.__adobe_cep__)
    //     return new Promise((resolve, reject) => {
    //       window.__adobe_cep__.evalScript(`${text}`, res => {
    //         if (res) resolve(this.isJson(res) ? JSON.parse(res) : res);
    //         else reject({ error: res });
    //       });
    //     });
    //   else return defs;
    // },
    // isJson(str) {
    //   try {
    //     JSON.parse(str);
    //   } catch (e) {
    //     return false;
    //   }
    //   return true;
    // }
  }
};
</script>

<style>
.main-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}

.buttonwrap {
  display: flex;
  flex-direction: column;
}

.q-table__card {
  background: var(--color-bg);
  color: var(--color-default);
}

.q-field__native,
.q-field__prefix,
.q-field__suffix {
  color: var(--color-default);
}

.q-field__marginal {
  color: var(--color-default);
}

.q-table thead,
.q-table tr,
.q-table th,
.q-table td,
.q-table__bottom {
  border-color: var(--color-btn-disabled-text);
}
</style>
