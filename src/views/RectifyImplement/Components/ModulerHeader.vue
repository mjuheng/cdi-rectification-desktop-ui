<template>
  <div class="moduler-header-wrapper">
    <div class="moduler-header-title">{{ title }}</div>
    <div class="moduler-header-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModulerHeader",    
  components: {},
  props: {
    title: {
      type: String,
      default: "反馈会",
    },
  },
  data() {
    return {};
  },
  watch: {},
  computed: {},
  mounted() {},
  methods: {},
};
</script>

<style lang="less" scoped>
.moduler-header-wrapper {
  height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .moduler-header-title {
    font-size: 16px;
    font-weight: bold;
    border-left: 4px solid #007bff;
    padding-left: 12px;
  }
  .moduler-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 30px;
  }
}
</style>
