<script setup>
import { ref, getCurrentInstance } from 'vue';
import axios from '@/libs/axios';
import router from '@/libs/router';

const app = getCurrentInstance();
const tip = ref();
let dotCount = 1;
setInterval(() => {
  tip.value = '数据加载中，请稍后' + '.'.repeat(dotCount++ % 4);
}, 500);

console.log('Page: loading ');
axios
  .get('https://api.github.com/repos/y80/y80.github.io/contents/db/nav.json')
  .then((data) => {
    app.appContext.config.globalProperties.$db = JSON.parse(
      decodeURIComponent(escape(atob(data.content)))
    );
    router.replace('/index');
  });
</script>

<template>
  <div class="loading-container">{{tip}}</div>
</template>

<style lang="scss" scoped>
.loading-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: grid;
  background: rgb(226, 226, 226);

  place-items: center;
}

</style>