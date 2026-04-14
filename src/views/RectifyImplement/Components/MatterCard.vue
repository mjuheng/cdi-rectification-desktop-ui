<template>
  <div class="matter-card">
    <div class="matter-card__title flex-ac">
      {{ title }}
    </div>
    <slot name="main-content"></slot>
    <div
      class="matter-card__content"
      v-for="(ctx, index) in items"
      :key="index"
    >
      <div class="matter-card__subtitle">{{ ctx.title }}</div>
      <slot :name="ctx.slot"></slot>
    </div>
    <div class="matter-card__subtitle" v-if="subtitle">{{ subtitle }}</div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    items: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>

<style lang="less" scoped>
.common-title() {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 20px;
}
.matter-card {
  &__title {
    .common-title;
    font-size: 18px;
  }
  &__subtitle {
    .common-title;
    font-size: 16px;
    position: relative;
    padding-left: 10px;
    margin-bottom: 16px;
    &::before {
      position: absolute;
      top: 50%;
      transform: translatey(-50%);
      left: 0;
      content: "";
      width: 2px;
      height: 14px;
      background-color: #0052d9;
    }
  }
}
</style>
