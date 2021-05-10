<template>
  <main>
    <div class="tag-box">
      <tag v-for="item of tagList"
           size="medium"
           showBoxShadow
           :key="item.id"
           :entity="item"
           @click="filterBookmarksByTag(item)" />
    </div>

    <div class="flex-between tip">
      <span @click="resetBookmarks">{{ tip }}</span>
      <div class="button-group">
        <button @click="generateSerializedFile"
                class="button margin-r is-small is-ghost"
                :class="{ 'is-loading': isSerializing }">重置序列化文件</button>
        <button class="button is-small is-inverted is-info"
                @click="openModal()">添加</button>
      </div>
    </div>

    <div class="bookmark-box">
      <BookmarkBlock v-for="item of bookmarks"
                     @clickTag="filterBookmarksByTag"
                     :key="item.name"
                     :entity="item"
                     :edit="openModal"
                     :del="openRemoveModal" />
    </div>
  </main>

  <!-- 删除对话框 -->
  <Confirm :message="removeModal.message"
           :title="`确定要删除书签“${removeModal.bookmark.name}”吗？`"
           :isSubmitting="removeModal.isSubmitting"
           v-model:visible="removeModal.visible"
           @confirm="removeBookmark" />

  <!-- 新建书签对话框 -->
  <Confirm :title="modal.title"
           @confirm="sendBookmark"
           v-model:visible="modal.visible">
    <FormItem label="名称"
              v-model="modal.bookmark.name" />
    <FormItem label="链接"
              v-model="modal.bookmark.url" />
    <FormItem label="描述"
              v-model="modal.bookmark.description" />
    <FormItem label="图标">
      <p class="flex-between">
        <button class="button margin-r"
                :class="{'is-loading': isFetchingIcon}"
                @click="fetchIcon">获取图标</button>
        <input class="input"
               :value="modal.bookmark.icon">
        <img v-show="modal.bookmark.icon"
             style="width: 64px"
             class="margin-l round-border"
             :src="modal.bookmark.icon">
      </p>
    </FormItem>
    <FormItem label="关联标签">
      <div class="tags picked-tags-box">
        <Tag v-for="tag of modal.pickedTagList"
             :key="tag.name"
             :entity="tag" />
        <p v-if="!modal.pickedTagList?.length"
           class="empty-tip">
          暂无关联标签，请从下方选取
        </p>
      </div>
      <TagPicker :pickedTagList="modal.pickedTagList"
                 :confirm="(tags) => modal.pickedTagList = tags" />
    </FormItem>
  </Confirm>
</template>

<script setup>
import useLinkOperator from '@/composables/useLinkOperator';
import Tag from '@/components/Tag.vue';
import Confirm from '@/components/Confirm.vue';
import TagPicker from '@/components/TagPicker.vue';
import Table from '@/components/Table.vue';
import FormItem from '@/components/FormItem.vue';
import BookmarkBlock from '@/components/BookmarkBlock.vue';
import useTagOperator from '@/composables/useTagOperator';
import { reactive, ref, watch } from 'vue';
import * as api from '@/libs/api';
import { handleError } from '@/libs/utils';
import { useStore } from 'vuex';
import { setLoadingState } from '@/hooks/usePageLoading';

const store = useStore();
const { tagList, getAllTags } = useTagOperator();
const { addLinks, delLinks } = useLinkOperator();

const bookmarks = ref([]);
const tip = ref('');
const modal = reactive({
  visible: false,
  bookmark: {},
  tags: [],
});
const removeModal = reactive({
  visible: false,
  isSubmitting: false,
  bookmark: {},
});

getAllTags().then((tags) => store.commit('setTags', tags));

function getData() {
  setLoadingState(true);
  api.bookmark.getAll().then((list) => {
    setLoadingState(false);
    bookmarks.value = list;

    const payload = {};
    list.forEach((bookmark) => {
      payload[bookmark.id] = {
        ...bookmark,
        tagIdList: bookmark.tagList.map((tag) => tag.id),
      };
    });
    store.commit('setBookmarks', payload);
  });
}

getData();

function openRemoveModal(bookmark) {
  removeModal.bookmark = bookmark;
  removeModal.visible = true;
}

function removeBookmark() {
  removeModal.isSubmitting = true;
  api.bookmark.remove(removeModal.bookmark.id).then(() => {
    removeModal.isSubmitting = false;
    getData();
  });
}

// 打开创建、编辑对话框
function openModal(bookmark) {
  if (bookmark) {
    modal.title = '书签';
    modal.bookmark = { ...bookmark };
    modal.pickedTagList = bookmark.tagList;
  } else {
    modal.title = '新增书签';
    modal.bookmark = { name: '', url: '', description: '' };
    modal.pickedTagList = [];
  }
  modal.visible = true;
}

// 确认添加、编辑书签
function sendBookmark() {
  const newTagIdList = this.modal.pickedTagList.map((tag) => tag.id);

  if (!modal.bookmark.id) {
    // 添加书签
    api.bookmark
      .add(modal.bookmark)
      .then(({ id }) => {
        addLinks({ bookmarkId: id, tagIdList: newTagIdList }).then(getData);
      })
      .catch(handleError);
  } else {
    // 编辑书签
    delete modal.bookmark.tagList;
    api.bookmark
      .update({
        ...modal.bookmark,
        tagIdList: newTagIdList,
      })
      .then(getData)
      .catch(handleError);
  }
  // 滚动至底部
  window.scrollTo(0, Number.MAX_SAFE_INTEGER);
}

function filterBookmarksByTag(tag) {
  tip.value = `“${tag.name}”关联的书签`;
  bookmarks.value = store.getters.getBookmarksByTagId(tag.id);
}

function resetBookmarks() {
  tip.value = '所有书签';
  bookmarks.value = store.getters.getBookmarks;
}

const isSerializing = ref(false);
// 生成序列化文件
function generateSerializedFile() {
  isSerializing.value = true;
  api
    .generateSerializedFile()
    .then(() => {
      alert('已重置序列化文件');
    })
    .catch(handleError)
    .finally(() => {
      isSerializing.value = false;
    });
}

const isFetchingIcon = ref(false);
// 根据域名获取响应的图标地址
function fetchIcon() {
  let domain;
  try {
    const arr = modal.bookmark.url.split('.');
    domain = arr[arr.length - 2] + '.' + arr[arr.length - 1];
    if (!domain) throw new Error();
  } catch (error) {
    alert('请输入有效的链接');
    return;
  }
  modal.bookmark.icon = '';
  isFetchingIcon.value = true;
  $axios
    .get(
      `https://service-j3cuc7cz-1257263957.sh.apigw.tencentcs.com/get-favicon/${domain}`
    )
    .then((iconSrc) => {
      modal.bookmark.icon = iconSrc;
    })
    .catch(() => {
      alert('获取图标失败，请重试');
    })
    .finally(() => {
      isFetchingIcon.value = false;
    });
}
</script>

<style lang="scss" scoped>
@use '../home/index.scss';

.btn-add {
  position: fixed;
  right: 5rem;
  bottom: 8.1rem;
  z-index: 1;
  // color: rgb(65, 65, 65);
  text-shadow: 1px 1px 5px #00002e;
  font-size: 5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  transform: scale(1.2);
}

.picked-tags-box {
  min-height: 2rem;
  p {
    margin: 0 auto;
    color: #888;
    font-weight: 100;
    font-size: 0.825rem;
  }
}
</style>
