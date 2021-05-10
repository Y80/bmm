<template>
  <div class="block flex-between">
    <span>共 <span class="is-size-3">{{ table.data.length }}</span> 个标签</span>
    <button class="level-item button is-primary"
            @click="openModal()">
      创建新标签
    </button>
  </div>

  <Table :data="table.data"
         :buttonList="table.buttonList"
         :columnList="table.columnList" />

  <!-- 创建、编辑标签 -->
  <Confirm v-model:visible="modal.visible"
           :title="modal.title"
           :isSubmitting="modal.isSubmitting"
           @confirm="sendTag">
    <div>
      <FormItem label="名称"
                v-model="modal.tag.name" />
      <FormItem label="Hue"
                type="number"
                v-model="modal.tag.hue" />
    </div>
  </Confirm>

  <!-- 确认删除对话框 -->
  <Confirm v-model:visible="removeModal.visible"
           confirmType="danger"
           :isSubmitting="removeModal.isSubmitting"
           :title="`确定要删除标签“${removeModal.tag.name}”吗？`"
           @confirm="removeTag" />

</template>

<script setup>
import { reactive } from 'vue';
import Table from '@/components/Table.vue';
import Confirm from '@/components/Confirm.vue';
import * as api from '@/libs/api';
import { handleError } from '@/libs/utils';
import { useStore } from 'vuex';
import { setLoadingState } from '@/hooks/usePageLoading';

const store = useStore();

const table = reactive({
  columnList: [
    { label: '标签名', prop: 'name' },
    { label: '色相值', prop: 'hue' },
    { label: '关联书签数量', prop: 'bookmarkNum' },
  ],
  buttonList: [
    { text: '编辑', handler: openModal },
    { text: '删除', handler: openRemoveModal },
  ],
  data: [],
});

const modal = reactive({
  visible: false,
  title: '',
  isSubmitting: false,
  tag: {},
});

// 删除对话框
const removeModal = reactive({
  visible: false,
  title: '',
  isSubmitting: false,
  tag: {},
});

function getTags() {
  setLoadingState(true);
  api.tag
    .getAll()
    .then((data) => {
      table.data = data;

      const tags = {};
      data.forEach((tag) => (tags[tag.id] = tag));
      store.commit('setTags', tags);
    })
    .finally(() => {
      setLoadingState(false);
    });
}

getTags();

function openModal(row) {
  if (row) {
    modal.title = `编辑标签“${row.name}”`;
    modal.tag = { ...row };
  } else {
    modal.title = '新增标签';
    modal.tag = { name: '', hue: parseInt(Math.random() * 360) };
  }
  modal.visible = true;
}

function openRemoveModal(tag) {
  removeModal.tag = tag;
  removeModal.visible = true;
}

function sendTag() {
  if (!modal.tag.name || !modal.tag.hue) {
    alert('请填写完整表单');
    return;
  }

  const promise = modal.tag.id
    ? api.tag.update(modal.tag)
    : api.tag.add(modal.tag);

  modal.isSubmitting = true;
  promise
    .then(() => {
      modal.visible = false;
      getTags();
    })
    .catch(handleError)
    .finally(() => {
      modal.isSubmitting = false;
    });
}

function removeTag() {
  removeModal.isSubmitting = true;
  api.tag
    .remove(removeModal.tag.id)
    .then(() => {
      removeModal.visible = false;
      getTags();
    })
    .finally(() => {
      removeModal.isSubmitting = false;
    });
}
</script>

<style lang="scss" scoped>
.hue {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}
</style>
