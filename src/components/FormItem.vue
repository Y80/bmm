<template>
  <section class="field">
    <label class="label">{{ label }}</label>
    <slot>
      <input
        :value="modelValue"
        type="text"
        class="input"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </slot>
  </section>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    // 绑定的值
    modelValue: {
      require: true,
    },
    // 表单类型，默认为文本输入框
    type: {
      type: String,
      default: 'text',
    },
  },

  emits: ['update:modelValue'],
}
</script>
