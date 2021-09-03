import { NButton, NIcon, NSpace, NTag, NThing } from 'naive-ui'
import { CSSProperties, defineComponent, PropType } from 'vue'
import { Tag, ArrowRight } from '@vicons/tabler'
import store from '../store'

const style: CSSProperties = {
  boxShadow: '5px 5px 10px #ebebeb, -5px -5px 10px #ffffff',
  borderRadius: '8px',
  margin: '1rem 0 3rem',
  padding: '1rem 0.5rem',
}

export default defineComponent({
  props: {
    currentTagId: {
      type: Number,
    },
    onTagClick: {
      required: true,
      type: Function as PropType<(tagId?: number) => void>,
    },
    onManagerClick: {
      required: true,
      type: Function as PropType<() => void>,
    },
  },

  setup(props) {
    store.dispatch('getAllTags')

    return () => (
      <NThing style={style}>
        {{
          avatar: () => (
            <NIcon size="25">
              <Tag />
            </NIcon>
          ),
          header: () => '标签池',
          'header-extra': () => (
            <NButton
              bordered={false}
              size="small"
              iconPlacement="right"
              onClick={props.onManagerClick}
            >
              {{
                default: () => '管理标签',
                icon: () => (
                  <NIcon size="16">
                    <ArrowRight></ArrowRight>
                  </NIcon>
                ),
              }}
            </NButton>
          ),
          default: () => (
            <NSpace>
              {store.state.tags.map((tag) => (
                <NButton
                  text
                  onClick={() =>
                    props.onTagClick(props.currentTagId === tag.id ? undefined : tag.id)
                  }
                >
                  <NTag
                    style={{ cursor: 'pointer' }}
                    type={props.currentTagId === tag.id ? 'primary' : 'default'}
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
