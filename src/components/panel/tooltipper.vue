<template>
  <q-tooltip anchor="top middle" :self="selfPos" :offset="offset">{{
    msg
  }}</q-tooltip>
</template>

<script>
export default {
  name: "tooltipper",
  props: {
    msg: String,
    nudge: {
      type: String,
      default: ""
    }
  },
  computed: {
    offset() {
      if (/left/i.test(this.nudge)) return [10, 10];
      else if (/right/i.test(this.nudge)) return [0, 10];
      else return [10, 10];
    },
    selfPos() {
      if (/left/i.test(this.nudge)) return "bottom right";
      else if (/right/i.test(this.nudge)) return "bottom left";
      else return "bottom middle";
    }
  }
};
</script>
