<template>
  <div class="box tag-picker"
       v-show="visible">
    <div class="block tags">
      <span class="tag"
            :class="tag.picked ? 'is-primary' : ''"
            v-for="(tag, idx) of tagList"
            @click="onClickTag(idx)"
            :key="tag.name">{{ tag.name }}</span>
    </div>
    <div class="flex-end">
      <!-- <button class="button is-text" @click="close">关闭</button> -->
      <!-- <button class="button is-text" @click="confirmHandler">确认</button> -->
      <!-- <button class="button is-text" @click="refresh">刷新</button> -->
      <i class="iconfont iconshuaxin"
         @click="refresh"></i>
    </div>
  </div>
</template>

<script>
import { registerRuntimeCompiler } from 'vue';
import useTagOperator from '../composables/useTagOperator';

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
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
    // 触发 @update:visible 事件，将该值设为 false
    close() {
      this.$emit('update:visible', false);
    },

    confirmHandler() {
      const pickedTagList = [];
      this.tagList.forEach((tag) => {
        if (tag.picked) {
          pickedTagList.push(tag);
        }
      });
      // this.$emit('confirm', pickedTagList);
      this.confirm(pickedTagList);
      // this.close()
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
    visible(newValue, oldValue) {
      if (oldValue === false && newValue === true) {
        this.hightLightPickedTag();
      }
    },

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

@keyframes rotate360 {
  100% {
    transform: rotate(360deg);
  }
}
</style>
