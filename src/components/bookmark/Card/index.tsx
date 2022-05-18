import { defineComponent, PropType, reactive, watchEffect } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { Edit, TrashOff, Plus } from '@vicons/tabler'
import { IBookmark } from '../../../interface'
import styles from './styles.module.css'
import classNames from 'classnames'

const DEFAULT_FAVICON = 'http://cdn.gu13.cn/favicon/default.svg'
const FAILED_FAVICON = 'http://cdn.gu13.cn/favicon/img_fail.svg'

export default defineComponent({
  props: {
    dataSource: {
      required: true,
      type: Object as PropType<IBookmark>,
    },
    onRemove: {
      required: true,
      type: Function as PropType<(bookmark: IBookmark) => void>,
    },
    onEdit: {
      required: true,
      type: Function as PropType<(bookmark: IBookmark) => void>,
    },
    onTagClick: {
      required: true,
      type: Function as PropType<(tagId: number) => void>,
    },
    editable: {
      type: Boolean as PropType<boolean>,
    },
  },

  setup(props) {
    const state = reactive({
      favicon: '',
    })

    watchEffect(() => {
      state.favicon = props.dataSource.favicon || DEFAULT_FAVICON
    })

    return () => (
      <div class={classNames('border-slate-200', 'border', 'rounded-lg', 'px-5 py-3.5 lt-sm:p-3', 'bg-white')}>
        <div class={classNames(styles.header, 'gap-2')} onClick={() => window.open(props.dataSource.url)}>
          <img src={state.favicon} class="h-6 rounded" alt="favicon" onError={() => (state.favicon = FAILED_FAVICON)} />
          <h2 class="text-gray-6 hover:text-gray-8 text-lg">{props.dataSource.name}</h2>
          <div style={{ width: props.editable ? '42px' : '0px' }} class={styles.buttonGroup}>
            <NButton
              text
              class="text-gray-4"
              onClick={(e) => {
                e.stopPropagation()
                props.onEdit(props.dataSource)
              }}
              v-slots={{
                icon: () => (
                  <NIcon>
                    <Edit />
                  </NIcon>
                ),
              }}
            />
            <NButton
              text
              class="text-gray-4"
              onClick={(e) => {
                e.stopPropagation()
                props.onRemove(props.dataSource)
              }}
              v-slots={{
                icon: () => (
                  <NIcon>
                    <TrashOff />
                  </NIcon>
                ),
              }}
            />
          </div>
        </div>
        <p class={classNames(styles.description, 'text-gray-4', 'mt-2 mb-0', 'text-base')}>
          {props.dataSource.description}
        </p>
        <div class={classNames(styles.tagsBox, 'gap-2', 'mt-1')}>
          {props.dataSource.tags.map((tag) => (
            <a
              key={tag.id}
              class="cursor-pointer bg-gray-100 text-slate-400 text-sm px-2 py-0.5 rounded whitespace-nowrap"
              onClick={() => props.onTagClick(tag.id)}
            >
              {tag.name}
            </a>
          ))}
          {/* <NButton size="tiny" v-show={!props.dataSource.tags.length} onClick={() => props.onEdit(props.dataSource)}>
            {{
              default: () => '添加标签',
              icon: () => (
                <NIcon>
                  <Plus />
                </NIcon>
              ),
            }}
          </NButton> */}
        </div>
      </div>
    )
  },
})
