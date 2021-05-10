当前页面仅作为一个跳转页面。 用于获取序列化的静态文件。

<script setup>
import { ref, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getDatabase } from '@/libs/api';
import { setLoadingState } from '@/hooks/usePageLoading';

const store = useStore();
const router = useRouter();

setLoadingState(true);
getDatabase().then((database) => {
  setLoadingState(false);
  store.commit('setTags', database.tags);
  store.commit('setBookmarks', database.bookmarks);
  nextTick(() => {
    router.back();
  });
});
</script>

<template>
  <div></div>
</template>