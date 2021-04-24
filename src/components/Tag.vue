<template>
  <span class="tag is-rounded"
        :class="classValue"
        v-if="entity"
        :style="style">{{ entity.name }}</span>
  <span v-else
        :class="classValue">{{ data.name || data }}</span>
</template>

<script>
export default {
  props: {
    entity: {
      type: Object,
    },
    // 标签文本
    data: {
      type: [String, Object],
    },
    // 尺寸
    size: {
      type: String,
      default: 'medium',
      validator(value) {
        return ['normal', 'medium', 'large'].includes(value);
      },
    },
    // 可否删除
    removable: {
      type: Boolean,
      default: false,
    },
    showBoxShadow: {
      type: Boolean,
      default: false,
    },
  },

  setup() {},

  data() {
    return {};
  },

  computed: {
    classValue() {
      let rst = `tag is-rounded is-${this.size} `;
      if (this.removable) rst += 'is-delete ';
      return rst;
    },

    style() {
      const hue = this.entity.hue;
      let background = `background: linear-gradient(145deg, hsla(${hue}, 100%, 80%, 0.1), hsla(${hue}, 100%, 50%, 0.1));`;
      let color = `color: hsl(${hue}, 80%, 25%);`;
      let boxShadow = this.showBoxShadow
        ? `box-shadow: 0px 3px 3px hsl(${hue}, 100%, 90%)`
        : '';
      let fontWeight = this.size === 'normal' ? 'font-weight: 100;' : '';
      return background + color + boxShadow + fontWeight;
    },
  },
};
</script>

<style lang="scss" scoped>
.tag {
  transform: scale(1);
}

span {
  cursor: pointer;

  user-select: none;
}
</style>
