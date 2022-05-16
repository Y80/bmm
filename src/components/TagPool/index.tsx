import { NButton, NIcon, NSpace, NTag, NThing } from 'naive-ui'
import { defineComponent, PropType } from 'vue'
import { Tag, ArrowRight } from '@vicons/tabler'
import store from '../../store'
import styles from './styles.module.css'
import classNames from 'classnames'

export default defineComponent({
  props: {
    currentTagId: {
      type: Number,
    },
    onTagClick: {
      required: true,
      type: Function as PropType<(tagId: number) => void>,
    },
    onManagerClick: {
      required: true,
      type: Function,
    },
  },

  setup(props) {
    store.dispatch('getAllTags')

    return () => (
      <NThing class={classNames(styles.root, 'border', 'border-slate-200')}>
        {{
          avatar: () => (
            <NIcon size="25">
              <Tag />
            </NIcon>
          ),
          header: () => '标签池',
          'header-extra': () => (
            <NButton bordered={false} size="small" iconPlacement="right" onClick={() => props.onManagerClick()}>
              {{
                default: () => '管理标签',
                icon: () => (
                  <NIcon size="16">
                    <ArrowRight />
                  </NIcon>
                ),
              }}
            </NButton>
          ),
          default: () => (
            <NSpace>
              {store.state.tags.map((tag) => (
                <NButton text disabled={props.currentTagId === tag.id} onClick={() => props.onTagClick(tag.id)}>
                  <NTag
                    style={{
                      cursor: 'pointer',
                      background: 'white',
                      border: 'none',
                      color: props.currentTagId === tag.id ? 'var(--primary-color)' : '#999',
                    }}
                    themeOverrides={{
                      fontSizeMedium: '12px',
                      heightMedium: '24px',
                    }}
                    round
                  >
                    {tag.name}
                  </NTag>
                </NButton>
              ))}
            </NSpace>
          ),
        }}
      </NThing>
    )
  },
})
