import { defineComponent, PropType, reactive, watchEffect } from 'vue'
import { NButton, NCard, NConfigProvider, NIcon, NTooltip } from 'naive-ui'
import { Edit, TrashOff, Plus } from '@vicons/tabler'
import { IBookmark } from '../../interface'
import store from '../../store'
import classes from '@style/components/bookmark-card.module.css'

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
      <NConfigProvider themeOverrides={{ Card: { paddingMedium: store.state.isMobile ? '5px 7px' : '5px 15px' } }}>
        <NCard
          class={classes.root}
          v-slots={{
            header: () => (
              <div class={classes.header}>
                <img src={state.favicon} alt="favicon" onError={() => (state.favicon = FAILED_FAVICON)} />
                <NTooltip
                  placement="top-start"
                  displayDirective="if"
                  v-slots={{
                    trigger: () => (
                      <span onClick={() => window.open(props.dataSource.url)}>{props.dataSource.name}</span>
                    ),
                    default: () =>
                      props.dataSource.name + (props.dataSource.description && `: ${props.dataSource.description}`),
                  }}
                />
              </div>
            ),
            'header-extra': () =>
              props.editable && (
                <>
                  <NButton
                    text
                    style="margin-right: 5px"
                    onClick={() => props.onEdit(props.dataSource)}
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
                    onClick={() => props.onRemove(props.dataSource)}
                    v-slots={{
                      icon: () => (
                        <NIcon>
                          <TrashOff />
                        </NIcon>
                      ),
                    }}
                  />
                </>
              ),
            default: () => (
              <div class={classes.tagsBox}>
                {props.dataSource.tags.map((tag) => (
                  <NButton size="tiny" secondary type="tertiary" key={tag.id} onClick={() => props.onTagClick(tag.id)}>
                    {tag.name}
                  </NButton>
                ))}
                <NButton
                  size="tiny"
                  v-show={!props.dataSource.tags.length}
                  onClick={() => props.onEdit(props.dataSource)}
                >
                  {{
                    default: () => '添加标签',
                    icon: () => (
                      <NIcon>
                        <Plus />
                      </NIcon>
                    ),
                  }}
                </NButton>
              </div>
            ),
          }}
        />
      </NConfigProvider>
    )
  },
})
