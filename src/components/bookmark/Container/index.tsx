import { NSpace, NSpin, NDivider } from 'naive-ui'
import { defineComponent } from 'vue'
import styles from './styles.module.css'

export default defineComponent({
  props: { loading: Boolean },

  setup(props, { slots }) {
    return () => (
      <div class={styles.root}>
        <NSpace justify="center">
          <NSpin v-show={props.loading} style={{ minHeight: '100px' }} />
        </NSpace>
        <div v-show={!props.loading}>
          <div class={styles.bookmarkContainer}>{slots.default?.()}</div>
          <NDivider>
            <span class={styles.dividerText}>完</span>
          </NDivider>
        </div>
      </div>
    )
  },
})
