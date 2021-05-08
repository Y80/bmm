<template>
  <div v-if="db">
    <div class="tag-box">
      <tag v-for="item of db.tags"
           size="medium"
           showBoxShadow
           :key="item.id"
           :entity="item"
           @click="clickTag(item)" />
    </div>

    <div class="tip">
      <span @click="resetShowBookmarks">{{ tip }}</span>
    </div>

    <div class="container bookmark-box">
      <bookmark-block v-for="item of showBookmarks"
                      :key="item.id"
                      :entity="item" />
    </div>
  </div>
</template>

<script setup>
import BookmarkBlock from '@/components/BookmarkBlock.vue';
import Tag from '@/components/Tag.vue';
import router from '@/libs/router';
import {
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onUpdated,
  reactive,
  ref,
} from 'vue';

const app = getCurrentInstance();
const db = app.appContext.config.globalProperties.$db;

const tip = ref('所有书签');
let showBookmarks = ref([]);

if (!db) {
  // db 为空，router.push() 可以正常执行，但不会立马跳转到对应的页面
  // 因此下面的代码会继续执行
  router.push('/loading');
} else {
  showBookmarks.value = Object.values(db.bookmarks);
}

const clickTag = (tag) => {
  tip.value = `“${tag.name}”关联的书签`;
  showBookmarks.value = [];
  Object.values(db.bookmarks).forEach((bookmark) => {
    if (bookmark.tagIdList.includes(tag.id)) {
      showBookmarks.value.push(bookmark);
    }
  });
};

const resetShowBookmarks = () => {
  tip.value = '所有书签';
  showBookmarks.value = db.bookmarks;
};
</script>

<style lang="scss" scoped>
@use './index.scss';

</style>
