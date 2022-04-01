import { defineComponent } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'

export default defineComponent({
  setup(props, { slots }) {
    return () => (
      <NLayout>
        <NLayoutContent
          contentStyle={{
            padding: '10vh 10px 50px 10px',
            maxWidth: '1295px',
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          {slots.default?.()}
        </NLayoutContent>
      </NLayout>
    )
  },
})
