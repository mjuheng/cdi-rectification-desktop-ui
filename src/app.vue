<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import autofit from "autofit.js";
export default {
  name: "AppMain",
  mounted() {
    autofit.init();
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Arial", "Microsoft YaHei", sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>