<template>
  <table class="table is-fullwidth">
    <thead>
      <tr>
        <th v-if="showIndex"></th>
        <th v-for="column of config.columnList" :key="column.label">
          {{ column.label }}
        </th>
        <th v-if="isBookmark" style="min-width: 12rem">关联标签</th>

        <th v-if="buttonList.length">操作</th>
      </tr>
    </thead>
    <div v-if="value?.length === 0" class="empty-tip">暂无数据</div>
    <tbody v-else>
      <tr v-for="(row, idx) of value" :key="idx">
        <th v-if="showIndex">{{ idx + 1 }}</th>
        <td v-for="column of config.columnList" :key="column.label">
          {{ column.output ? column.output(row) : row[column.prop] }}
        </td>
        <td v-if="isBookmark">
          <span class="tags">
            <Tag
              v-for="tag of row.tagList"
              :key="tag"
              size="normal"
              :data="tag"
            />
          </span>
        </td>

        <!-- 操作列 -->
        <td v-if="buttonList.length" style="min-width: 150px">
          <button
            class="button is-small mr-1"
            v-for="btn of buttonList"
            :key="btn.text"
            @click="btn.handler(row)"
          >
            {{ btn.text }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import Tag from './Tag.vue'

export default {
  components: {
    Tag,
  },
  props: {
    value: {
      type: Array,
      required: true,
    },
    config: {
      type: Object,
      default() {
        return {
          // 存放表格数据
          data: [],
          // 表格里的列
          columnList: [{ label: '', prop: '' }],
        }
      },
    },
    // 展示序号
    showIndex: {
      type: Boolean,
      default: true,
    },
    //  "操作"列允许的操作
    buttonList: {
      type: Array,
      default: [],
    },

    isBookmark: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {}
  },

  methods: {},

  created() {},
}
</script>

<style lang="scss" scoped>
.empty-tip {
  opacity: 0.8;
  height: 10rem;
}
</style>
