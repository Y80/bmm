<template>
  <div>
    <div class="tag-box">
      <Tag v-for="(tag, tagId) of tags"
           size="medium"
           showBoxShadow
           :key="tagId"
           :entity="tag"
           @click="clickTag(tag)" />
    </div>

    <div class="tip">
      <span @click="resetShowBookmarks">{{ tip }}</span>
    </div>

    <div class="container bookmark-box">
      <BookmarkBlock v-for="item of shownBookmarks"
                     :key="item.id"
                     @click-tag="clickTag"
                     :entity="item" />
    </div>
  </div>
</template>

<script setup>
import BookmarkBlock from '@/components/BookmarkBlock.vue';
import Tag from '@/components/Tag.vue';
import {
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onUpdated,
  reactive,
  ref,
} from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const bookmarks = store.getters.getBookmarks;
const tags = store.getters.getTags;

const tip = ref('所有书签');
const shownBookmarks = ref(Object.values(bookmarks));

const clickTag = (tag) => {
  tip.value = `“${tag.name}”关联的书签`;
  shownBookmarks.value = store.getters.getBookmarksByTagId(tag.id);
};

const resetShowBookmarks = () => {
  tip.value = '所有书签';
  shownBookmarks.value = Object.values(bookmarks);
};
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
