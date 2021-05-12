<template>
  <div>
    <div class="tag-box">
      <Tag v-for="(tag, tagId) of $store.getters.getTags"
           size="medium"
           showBoxShadow
           :key="tagId"
           :entity="tag"
           @click="handleClickTag(tag)" />
    </div>

    <div class="tip">
      <span @click="resetBookmarks">{{ tip }}</span>
    </div>

    <div class="container bookmark-box">
      <BookmarkBlock v-for="item of bookmarks"
                     :key="item.id"
                     @click-tag="handleClickTag"
                     :entity="item" />
    </div>
  </div>
</template>

<script setup>
import Tag from '@/components/Tag.vue';
import BookmarkBlock from '@/components/BookmarkBlock.vue';
import { nextTick, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const router = useRouter();

const targetPath = router.currentRoute.value.query.targetPath;
if (targetPath) {
  nextTick(() => router.push(decodeURIComponent(targetPath)));
}

const store = useStore();
const tip = ref('');
const bookmarks = ref([]);

function handleClickTag(tag) {
  tip.value = `“${tag.name}”关联的书签`;
  bookmarks.value = store.getters.getBookmarksByTagId(tag.id);
}

function resetBookmarks() {
  tip.value = '所有书签';
  bookmarks.value = store.getters.getBookmarks;
}

resetBookmarks();
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
