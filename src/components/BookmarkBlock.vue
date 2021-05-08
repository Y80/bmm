<template>
  <div class="bookmark-block">
    <section class="flex-start">
      <a class="name"
         :href="entity.url"
         target="_blank">{{ entity.name }}</a>
      <div class="icons"
           v-if="edit && del">
        <i class="iconfont iconbianji1 margin-r"
           @click="edit(entity)" />
        <i class="iconfont iconshanchu1"
           @click="del(entity)" />
      </div>
    </section>
    <section>
      <div class="tags">
        <Tag v-for="item of tagList"
             size="normal"
             :key="item.id"
             :entity="item" />
      </div>
    </section>
  </div>
</template>

<script>
import Tag from '@/components/Tag.vue';

export default {
  components: {
    Tag,
  },

  props: {
    entity: {
      type: Object,
      required: true,
    },
    edit: {
      type: Function,
      required: false,
    },
    del: {
      type: Function,
      required: false,
    },
  },

  data() {
    return {};
  },

  computed: {
    tagList() {
      if (this.entity.tagIdList) {
        return this.entity.tagIdList.map((tagId) => {
          return this.$db.tags[tagId];
        });
      } else if (this.entity.tagList) {
        return this.entity.tagList;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
div.bookmark-block {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 3px 3px 10px #6aa3ff36;

  .icons {
    text-align: right;

    flex-grow: 1;
    .iconfont {
      font-size: 1.2rem;
      opacity: 0.7;
      cursor: pointer;
      // transition: all 0.2s;
    }
    .iconfont:hover {
      opacity: 1;
    }

    .iconbianji1 {
      color: hsl(120, 80%, 60%);
    }

    .iconshanchu1 {
      color: hsl(1, 80%, 60%);
    }
  }

  .name {
    display: block;
    overflow: hidden;
    margin-left: 0.5rem;
    color: hsl(200, 100%, 5%);
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1.125rem;
    line-height: 1.625rem;
  }

  .name:hover {
    color: hsl(167, 100%, 45%);
    // text-shadow: 0 0 5px hsl(120, 100%, 80%);
  }

  .tags {
    overflow: auto;
    margin: 0.5rem 0 -0.5rem;
    padding-top: 0.5rem;
    height: 2.6rem;
    border-top: 1px solid #f5f5f5;
  }
}

</style>
