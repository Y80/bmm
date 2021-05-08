<template>
  <div class="block flex-between"
       style="margin-top: 6rem">
    <span>共 <span class="is-size-3">{{ tagList.length }}</span> 个标签</span>
    <button class="level-item button is-primary"
            @click="openAddDialog">
      创建新标签
    </button>
  </div>

  <Table :value="tagList"
         :buttonList="tableButtonList"
         :config="tableConfig" />

  <!-- 创建新标签 -->
  <Confirm v-model:visible="addDialog.visible"
           title="新建标签"
           @confirm="onConfirmCreateTag">
    <div>
      <FormItem label="名称"
                v-model="addDialog.tag.name" />
      <FormItem label="Hue"
                type="number"
                v-model="addDialog.tag.hue" />
    </div>
  </Confirm>

  <!-- 确认删除对话框 -->
  <Confirm v-model:visible="delDialog.visible"
           confirmText="删除"
           confirmType="danger"
           :title="`确定要删除标签“${delDialog.tagName}”吗？`"
           @confirm="deleteTag(delDialog.id)">
  </Confirm>

  <!-- 编辑标签对话框 -->
  <Confirm v-model:visible="editDialog.visible"
           title="编辑标签"
           cancelText="关闭"
           @confirm="onConfirmUpdateTag"
           confirmText="更新">
    <div>
      <div class="field">
        <label class="label">标签名称</label>
        <input class="input"
               type="text"
               v-model="editDialog.name"
               placeholder="请输入新标签名称" />
      </div>
      <div class="field">
        <label class="label">Hue</label>
        <input class="input"
               v-model="editDialog.hue"
               type="number" />
      </div>
    </div>
  </Confirm>
</template>

<script>
import { ref, reactive, watch, computed, provide, inject } from 'vue';
import Confirm from '../../components/Confirm.vue';
import useTagOperator from '../../composables/useTagOperator';
import Table from '../../components/Table.vue';

const DEFAULT_HUE_VALUE = 200;

export default {
  components: {
    Confirm,
    Table,
  },

  setup() {
    const {
      tagList,
      getAllTags,
      createTag,
      deleteTag,
      updateTag,
    } = useTagOperator();

    getAllTags();

    return { tagList, getAllTags, createTag, deleteTag, updateTag };
  },

  data() {
    return {
      tableConfig: {
        columnList: [
          { label: '标签名', prop: 'name' },
          { label: '色相值', prop: 'hue' },
          { label: '关联书签数量', prop: 'bookmarkNum' },
        ],
      },
      tableButtonList: [
        { text: '编辑', handler: this.openUpdateDialog },
        { text: '删除', handler: this.openDelDialog },
      ],
      addDialog: {
        visible: false,
        tag: { name: '', hue: 1 },
      },

      delDialog: {
        visible: false,
        id: '',
        tagName: '',
      },

      editDialog: {
        visible: false,
        id: '',
        name: '',
        hue: 1,
      },

      list: [],
    };
  },

  methods: {
    openAddDialog() {
      this.addDialog = {
        visible: true,
        tag: { name: '', hue: parseInt(Math.random() * 360) },
      };
    },

    openDelDialog(tag) {
      this.delDialog = {
        visible: true,
        id: tag.id,
        tagName: tag.name,
      };
    },

    openUpdateDialog(tag) {
      this.editDialog = {
        visible: true,
        id: tag.id,
        name: tag.name,
        hue: tag.hue,
      };
    },

    onConfirmCreateTag() {
      const payload = {
        name: this.addDialog.tag.name,
        hue: this.addDialog.tag.hue || DEFAULT_HUE_VALUE,
      };

      if (!payload.name) {
        alert('请输入有效标签名称');
        return;
      }

      this.createTag(payload).catch(alert);
    },

    onConfirmUpdateTag() {
      const payload = {
        id: this.editDialog.id,
        name: this.editDialog.name,
        hue: Number(this.editDialog.hue),
      };

      if (!payload.name) {
        alert('请输入有效标签名称');
        return;
      }

      this.updateTag(payload).catch(alert);
    },
  },

  created() {
    this.$utils.setSiteTitle('管理标签');
  },
};
</script>

<style lang="scss" scoped>
.hue {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

</style>
