<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getDatabase } from '@/libs/api';

const store = useStore();
const router = useRouter();
const { isLoading } = getCurrentInstance().root.proxy;

isLoading.fullScreen = true;
getDatabase().then((database) => {
  isLoading.fullScreen = false;
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