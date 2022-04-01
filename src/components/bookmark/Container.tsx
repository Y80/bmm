import { NSpace, NSpin } from 'naive-ui'
import { defineComponent } from 'vue'
import classes from '@style/components/bookmark-container.module.css'

export default defineComponent({
  props: { loading: Boolean },

  setup(props, { slots }) {
    return () => (
      <>
        <NSpace justify="center">
          <NSpin v-show={props.loading} style={{ minHeight: '100px' }} />
        </NSpace>

        <div v-show={!props.loading} class={classes.bookmarkContainer}>
          {slots.default?.()}
        </div>
      </>
    )
  },
})
