import { NSpace, NSpin } from 'naive-ui'
import { defineComponent } from 'vue'
import styles from './styles.module.css'

export default defineComponent({
  props: { loading: Boolean },

  setup(props, { slots }) {
    return () => (
      <>
        <NSpace justify="center">
          <NSpin v-show={props.loading} style={{ minHeight: '100px' }} />
        </NSpace>

        <div v-show={!props.loading} class={styles.bookmarkContainer}>
          {slots.default?.()}
        </div>
      </>
    )
  },
})
