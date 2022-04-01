import { defineComponent } from 'vue'
import Layout from '../../components/Layout'

export default defineComponent({
  setup() {
    return () => (
      <Layout>
        <p>index 页面</p>
        <p>TODO: 展示游客可见的书签</p>
      </Layout>
    )
  },
})
