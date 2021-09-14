import { NButton, NIcon, NSpace, NTag, NThing } from 'naive-ui'
import { defineComponent, PropType } from 'vue'
import { Tag, ArrowRight } from '@vicons/tabler'
import store from '../store'
import classes from '../style/components/tag-pool.module.css'

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
      <NThing class={classes.root}>
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
                    props.onTagClick(
                      props.currentTagId === tag.id ? undefined : tag.id
                    )
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
