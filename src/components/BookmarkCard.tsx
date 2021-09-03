import { NButton, NCard, NConfigProvider, NIcon, NTag, NTooltip } from 'naive-ui'
import { defineComponent, PropType, ref, watchEffect } from 'vue'
import { Edit, TrashOff, Plus } from '@vicons/tabler'
import { IBookmark } from '../interface'
import store from '../store'
import classes from '../style/components/bookmark-card.module.css'

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
    editable: {
      type: Boolean as PropType<boolean>,
    },
  },

  setup(props) {
    const imgSrc = ref('')

    watchEffect(() => {
      imgSrc.value = props.dataSource.favicon || 'http://cdn.gu13.cn/favicon/default.svg'
    })

    return () => (
      <NConfigProvider
        themeOverrides={{
          Button: { textColorText: '#8f8f8f' },
          Card: {
            paddingMedium: store.state.isMobile ? '5px 7px' : '5px 15px',
          },
          Tag: {
            textColor: '#2626268f',
          },
        }}
      >
        <NCard
          class={classes.root}
          hoverable
          v-slots={{
            header: () => (
              <>
                <img
                  style={{ display: 'block', borderRadius: '2px' }}
                  src={imgSrc.value}
                  alt="favicon"
                  width={20}
                  onError={() => (imgSrc.value = 'http://cdn.gu13.cn/favicon/img_fail.svg')}
                />
                <NTooltip
                  placement="top-start"
                  displayDirective="if"
                  v-slots={{
                    trigger: () => (
                      <span onClick={() => window.open(props.dataSource.url)}>
                        {props.dataSource.name}
                      </span>
                    ),
                    default: () =>
                      props.dataSource.name +
                      (props.dataSource.description && `: ${props.dataSource.description}`),
                  }}
                />
              </>
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
                  <NTag size="small" key={tag.id}>
                    {tag.name}
                  </NTag>
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
