// 确认对话框 // 可执行的操作：取消、确认

<template>
  <Dialog v-model:visible="visible_">
    <div class="box mx-5">
      <!-- 弹框标题 -->
      <section class="block">
        <p class="title is-5"
           v-if="title">
          {{ title }}
        </p>
      </section>
      <!-- 弹框主体 -->
      <section class="block">
        <slot>
          <p>{{ message }}</p>
        </slot>
      </section>
      <!-- 弹框底部操作区域 -->
      <section class="block has-text-right">
        <button class="button is-rounded mr-1 is-outlined "
                :class="`is-${cancelType}`"
                @click="close">
          {{ cancelText }}
        </button>
        <button class="button is-rounded is-outlined"
                :class="{ 'is-loading': isSubmitting, [`is-${confirmType}`]: true }"
                @click="confirm">
          {{ confirmText }}
        </button>
      </section>
    </div>
  </Dialog>
</template>

<script>
import Dialog from './Dialog.vue';

export default {
  components: {
    Dialog,
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    // 对话框的标题
    title: {
      type: String,
    },
    // 对话框主体的信息
    message: {
      type: String,
    },
    // 取消按钮的文本
    cancelText: {
      type: String,
      default: '取消',
    },
    // 确认按钮的颜色
    confirmText: {
      type: String,
      default: '确定',
    },
    // 控制取消按钮的颜色
    cancelType: {
      type: String,
      default: '',
    },
    // 控制确认按钮的颜色
    confirmType: {
      type: String,
      default: 'primary',
    },
    // 处理正在提交的状态
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      visible_: this.visible,
    };
  },

  watch: {
    visible_() {
      // 触发 @update:visible 事件,即更新父组件中的 visible 值
      this.$emit('update:visible', this.visible_);
    },

    visible() {
      this.visible_ = this.visible;
    },
  },

  methods: {
    close() {
      this.visible_ = false;
    },
    // 触发 @confirm 事件
    confirm() {
      this.$emit('confirm');
    },
  },
};
</script>
