<template>
  <div class="box tag-picker">
    <div class="block tags">
      <span class="tag"
            :class="tag.picked ? 'is-primary' : ''"
            v-for="(tag, idx) of tagList"
            @click="onClickTag(idx)"
            :key="tag.name">{{ tag.name }}</span>
    </div>
    <div class="flex-end">
      <i class="iconfont iconshuaxin"
         @click="refresh"></i>
    </div>
  </div>
</template>

<script>
import useTagOperator from '../composables/useTagOperator';

export default {
  props: {
    // 已经选中的标签列表
    pickedTagList: {
      type: Array,
      default() {
        return [];
      },
    },
    confirm: {
      type: Function,
      required: true,
    },
  },

  setup() {
    const { tagList, getAllTags } = useTagOperator();
    return { tagList, getAllTags };
  },

  data() {
    return {};
  },

  methods: {
    confirmHandler() {
      const pickedTagList = [];
      this.tagList.forEach((tag) => {
        if (tag.picked) {
          pickedTagList.push(tag);
        }
      });
      // this.$emit('confirm', pickedTagList);
      this.confirm(pickedTagList);
    },

    onClickTag(index) {
      this.tagList[index].picked = !this.tagList[index].picked;
      this.confirmHandler();
    },

    hightLightPickedTag() {
      this.tagList.forEach((tag) => {
        tag.picked = false;
        for (const pickedTag of this.pickedTagList) {
          if (pickedTag.name === tag.name) {
            tag.picked = true;
            break;
          }
        }
      });
    },

    refresh(e) {
      if (e) {
        e.target.style.animationPlayState = 'running';
      }
      this.getAllTags().then(() => {
        this.confirm([]);
        this.hightLightPickedTag();
        if (e) {
          e.target.style.animationPlayState = 'paused';
        }
      });
    },
  },

  watch: {
    pickedTagList() {
      this.hightLightPickedTag();
    },
  },

  mounted() {
    this.refresh();
  },
};
</script>

<style lang="scss" scoped>
.tag-picker {
  padding-bottom: 1em;
  box-shadow: inset 2px 2px 2px rgba(0, 0, 0, 0.15),
  inset -2px -2px 2px rgba(236, 236, 236, 0.5);

  & > .tags {
    margin-bottom: 0;
  }
}

.tag {
  cursor: pointer;

  user-select: none;
}

.iconfont {
  font-size: 1.5rem;
  cursor: pointer;
  animation: rotate360 0.3s linear infinite;
  animation-play-state: paused;
}

</style>
