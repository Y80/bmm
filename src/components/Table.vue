<template>
  <table class="table is-fullwidth">
    <thead>
      <tr>
        <!-- 列表序号 -->
        <th v-if="showIndex"></th>
        <th v-for="column of columnList"
            :key="column.label">
          {{ column.label }}
        </th>
        <th v-if="buttonList.length">操作</th>
      </tr>
    </thead>

    <div v-if="!data?.length"
         class="empty-tip">暂无数据</div>
    <tbody v-else>
      <tr v-for="(row, idx) of data"
          :key="idx">
        <th v-if="showIndex">{{ idx + 1 }}</th>
        <td v-for="column of columnList"
            :key="column.label">
          {{ column.output ? column.output(row) : row[column.prop] }}
        </td>

        <!-- 操作列 -->
        <td v-if="buttonList.length"
            style="min-width: 150px">
          <button class="button is-small mr-1 is-ghost"
                  v-for="btn of buttonList"
                  :key="btn.text"
                  @click="btn.handler(row)">
            {{ btn.text }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    // 表格的数据源
    data: {
      type: Array,
      required: true,
    },
    // 表头配置
    columnList: {
      type: Array, // {label: string, prop: string, output?: (row) => string}[]
      required: true,
    },
    // 展示序号
    showIndex: {
      type: Boolean,
      default: true,
    },
    //  "操作"列允许的操作
    buttonList: {
      type: Array, // {text: string | () => string, handler: (row) => void}[]
      required: false,
      default: [],
    },
  },
};
</script>

<style lang="scss" scoped>
.empty-tip {
  height: 10rem;
  opacity: 0.8;
}

tbody > tr:hover {
  background-color: rgba(230, 230, 230, 0.383);
}
</style>
