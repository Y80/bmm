<template>
  <div class="container"
       v-if="db">
    <div class="tag-box">
      <Tag v-for="item of db.tags"
           size="medium"
           showBoxShadow
           :key="item.id"
           :entity="item"
           @click="clickTag(item)" />
    </div>

    <div class="tip">
      <span @click="resetShowBookmarks">{{ tip }}</span>
    </div>

    <div class="bookmark-box">
      <bookmark-block v-for="item of showBookmarks"
                      :key="item.id"
                      :entity="item" />
      <p align="center"
         class="has-text-grey">- 没有更多书签了 -</p>
    </div>
  </div>
</template>

<script setup>
import BookmarkBlock from '@/components/BookmarkBlock.vue';
import Tag from '@/components/Tag.vue';
import router from '@/libs/router';
import {
  getCurrentInstance,
  isReactive,
  onBeforeMount,
  onMounted,
  onUpdated,
  reactive,
  ref,
  shallowReactive,
} from 'vue';
import useFindLinkedBookmark from '@/composables/useFindLinkedBookmark';

const app = getCurrentInstance();
const db = app.appContext.config.globalProperties.$db;

const tip = ref('所有书签');
let showBookmarks = ref([]);

if (!db) {
  // db 为空，router.push() 可以正常执行，但不会立马跳转到对应的页面
  // 因此下面的代码会继续执行
  // 代码执行出错，将中止代码执行，也就无法执行 loading 页面的代码
  router.push('/loading');
} else {
  showBookmarks.value = Object.values(db.bookmarks);
}

const clickTag = (tag) => {
  const { tip: tipValue, bookmarks } = useFindLinkedBookmark(tag);

  tip.value = tipValue;
  showBookmarks.value = bookmarks;
};

const resetShowBookmarks = () => {
  tip.value = '所有书签';
  showBookmarks = db.bookmarks;
};
</script>

<style lang="scss" scoped>
div.tag-box {
  margin-top: 5rem;
  margin-left: -0.75rem;

  .tag {
    margin: 0 1rem 0.75rem 0;
  }
}

div.bookmark-box {
  display: grid;
  overflow-y: auto;
  padding-right: 0.5rem;
  height: calc(100vh - 21rem);

  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  place-content: flex-start;

  & > p {
    grid-column-end: -1;
    grid-column-start: 1;
  }
}

.tip {
  margin: 2rem 0 1rem 0;
  border-bottom: 1px solid rgb(221, 221, 221);
  font-weight: bold;
  font-size: 1.25rem;

  span {
    cursor: pointer;
  }
}

</style>
