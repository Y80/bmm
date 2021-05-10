<template>
  <main>
    <div class="tag-box">
      <tag v-for="item of tagList"
           size="medium"
           showBoxShadow
           :key="item.id"
           :entity="item"
           @click="clickTag(item)" />
    </div>

    <!-- <i class="iconfont icontianjia btn-add" @click="openDialog()" ></i> -->

    <div class="flex-between tip">
      <span @click="resetShowBookmarks">{{ tip }}</span>
      <div class="button-group">
        <button @click="generateSerializedFile"
                class="button margin-r is-small is-ghost"
                :class="{ 'is-loading': serializing }">重置序列化文件</button>
        <button class="button is-small is-inverted is-info"
                @click="openDialog()">添加</button>
      </div>
    </div>

    <div class="bookmark-box">
      <BookmarkBlock v-for="item of showBookmarks"
                     :key="item.name"
                     :entity="item"
                     :edit="openDialog"
                     :del="openDelDialog" />
    </div>
  </main>

  <!-- 删除对话框 -->
  <Confirm :message="delDialog.message"
           v-model:visible="delDialog.visible"
           @confirm="deleteBookmark(delDialog.bookmark.id)" />

  <!-- 新建书签对话框 -->
  <Confirm :title="dialog.isAdd ? '新建书签' : '编辑书签'"
           @confirm="dialogConfirm"
           v-model:visible="dialog.visible">
    <FormItem label="名称"
              v-model="dialog.bookmark.name" />
    <FormItem label="链接"
              v-model="dialog.bookmark.url" />
    <FormItem label="描述"
              v-model="dialog.bookmark.description" />
    <FormItem label="图标">
      <p class="flex-between">
        <button class="button margin-r"
                :class="{'is-loading': loadingIcon}"
                @click="getFavicon">获取图标</button>
        <input class="input"
               :value="dialog.bookmark.icon">
        <img v-show="dialog.bookmark.icon"
             style="width: 64px"
             class="margin-l round-border"
             :src="dialog.bookmark.icon"
             alt="">
      </p>
    </FormItem>

    <FormItem label="关联标签">
      <div class="tags picked-tags-box">
        <!-- <button
          class="tag button"
          @click="dialog.showTagPicker = true"
          v-if="false"
        >
          编辑标签
        </button> -->
        <Tag v-for="tag of dialog.pickedTagList"
             :key="tag.name"
             :entity="tag" />
        <p v-if="!dialog.pickedTagList?.length"
           class="empty-tip">
          暂无关联标签，请从下方选取
        </p>
      </div>
      <TagPicker v-model:visible="dialog.showTagPicker"
                 :pickedTagList="dialog.pickedTagList"
                 :confirm="tagPickerConfirm" />
    </FormItem>
  </Confirm>
</template>

<script>
import useBookmarkOperator from '@/composables/useBookmarkOperator';
import useLinkOperator from '@/composables/useLinkOperator';
import Tag from '@/components/Tag.vue';
import Confirm from '@/components/Confirm.vue';
import TagPicker from '@/components/TagPicker.vue';
import Table from '@/components/Table.vue';
import FormItem from '@/components/FormItem.vue';
import BookmarkBlock from '@/components/BookmarkBlock.vue';
import useTagOperator from '@/composables/useTagOperator';
import { getCurrentInstance } from 'vue';

export default {
  name: 'bookmark',
  components: {
    FormItem,
    Tag,
    BookmarkBlock,
    TagPicker,
    Confirm,
    Table,
  },

  setup() {
    const { proxy } = getCurrentInstance().root;
    const {
      bookmarkList,
      getBookmarkList,
      deleteBookmark,
      addBookmark,
      updateBookmark,
    } = useBookmarkOperator();
    const { tagList, getAllTags } = useTagOperator();

    proxy.isLoading.fullScreen = true;
    Promise.all([getBookmarkList(), getAllTags()]).finally(() => {
      proxy.isLoading.fullScreen = false;
    });

    const { addLinks, delLinks } = useLinkOperator();

    return {
      bookmarkList,
      getBookmarkList,
      deleteBookmark,
      addBookmark,
      updateBookmark,
      addLinks,
      delLinks,
      tagList,
    };
  },

  data() {
    return {
      dialog: {
        visible: false,
        isAdd: false,
        bookmark: {
          name: '',
          url: '',
          icon: '',
          description: '',
        },
        showTagPicker: false,
        tags: [],
      },
      delDialog: {
        visible: false,
        message: '',
        bookmarkName: '',
      },
      showBookmarks: [],
      tip: '所有书签',
      serializing: false,
      loadingIcon: false,
    };
  },

  methods: {
    openDelDialog(bookmark) {
      this.delDialog = {
        visible: true,
        message: `确定要删除"${bookmark.name}"吗`,
        bookmark,
      };
    },

    // 打开创建、编辑对话框
    openDialog(bookmark = { name: '', url: '', icon: '', description: '' }) {
      this.dialog = {
        visible: true,
        isAdd: !bookmark.id,
        showTagPicker: true,
        bookmark,
        pickedTagList: bookmark.tagList || [],
      };
    },

    // 确认添加、编辑书签
    async dialogConfirm() {
      const { dialog } = this;
      // let discardTagIdList = []
      const newTagIdList = this.dialog.pickedTagList.map((tag) => {
        return tag.id;
      });

      if (dialog.isAdd) {
        // 添加书签
        this.addBookmark(dialog.bookmark)
          .then(({ id }) => {
            this.addLinks({ bookmarkId: id, tagIdList: newTagIdList }).then(
              this.getBookmarkList
            );
          })
          .catch((err) => {
            alert(err.message);
          });
      } else {
        // 编辑书签
        delete dialog.bookmark.tagList;
        await this.updateBookmark({
          ...dialog.bookmark,
          tagIdList: newTagIdList,
        });
        this.getBookmarkList();
      }
      // 滚动至底部
      window.scrollTo(0, Number.MAX_SAFE_INTEGER);
    },

    tagPickerConfirm(tagList) {
      this.dialog.pickedTagList = tagList;
    },

    clickTag(tag) {
      this.tip = `“${tag.name}”关联的书签`;
      this.showBookmarks = this.$store.getters.getBookmarksByTagId(tag.id);
    },

    resetShowBookmarks() {
      this.tip = '所有书签';
      this.showBookmarks = this.$store.getters.getBookmarks;
    },

    // 生成序列化文件
    generateSerializedFile() {
      this.serializing = true;
      this.$axios.get('/serialize').then(() => {
        this.serializing = false;
        this.$nextTick(() => {
          alert('已重置远程序列化文件');
        });
      });
    },

    // 根据域名获取响应的图标地址
    getFavicon() {
      let domain;
      try {
        const arr = this.dialog.bookmark.url.split('.');
        domain = arr[arr.length - 2] + '.' + arr[arr.length - 1];
        if (!domain) throw new Error();
      } catch (error) {
        alert('请输入有效的链接');
        return;
      }
      this.dialog.bookmark.icon = '';
      this.loadingIcon = true;
      this.$axios
        .get(
          `https://service-j3cuc7cz-1257263957.sh.apigw.tencentcs.com/get-favicon/${domain}`
        )
        .then((iconSrc) => {
          this.dialog.bookmark.icon = iconSrc;
        })
        .catch(() => {
          alert('获取图标失败，请重试');
        })
        .finally(() => {
          this.loadingIcon = false;
        });
    },
  },

  watch: {
    bookmarkList() {
      this.showBookmarks = this.bookmarkList;
    },
  },

  created() {
    this.$utils.setSiteTitle('管理书签');
  },
};
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
