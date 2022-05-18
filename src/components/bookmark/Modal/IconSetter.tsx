import { NSpace, NButton, NTabs, NTabPane, NInputGroup, NInput } from 'naive-ui'
import { defineComponent, PropType, reactive } from 'vue'
import { Trash as IconTrash } from '@vicons/tabler'

const URL_PREFIX = {
  // 通过代理，获取图标资源
  proxy: 'https://proxy.aliyun-api.workers.dev/?url=',
  // 解析 HTML，获取图标资源
  parser: 'https://favicon-finder.aliyun-api.workers.dev/',
}

export default defineComponent({
  props: {
    favicon: String,
    bookmarkUrl: {
      type: String,
      required: true,
    },
    setFavicon: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      loading: false,
      inputSrc: '',
    })

    async function fetchIcon(iconSrc?: string) {
      // 待请求的地址
      let url
      if (iconSrc) {
        url = URL_PREFIX.proxy + iconSrc
      } else {
        try {
          const { host } = new URL(props.bookmarkUrl)
          url = URL_PREFIX.parser + host
        } catch (error) {
          return window.$message.warning('请输入有效网址')
        }
      }

      state.loading = true
      try {
        const rsp = await fetch(url)
        if (rsp.status !== 200) throw new Error()
        const blob = await rsp.blob()
        await new Promise((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = () => {
            props.setFavicon(fileReader.result as string)
            resolve(null)
          }
          fileReader.onerror = reject
          fileReader.readAsDataURL(blob)
        })
      } catch (error) {
        window.$message.error('自动获取图标失败')
      } finally {
        state.loading = false
      }
    }

    return () => (
      <>
        {props.favicon ? (
          <NSpace align="center">
            <img style={{ display: 'block', width: '24px' }} src={props.favicon} />
            <NButton
              text
              type="error"
              style={{ display: 'block' }}
              onClick={() => props.setFavicon('')}
              v-slots={{ icon: () => <IconTrash /> }}
            />
          </NSpace>
        ) : (
          <NTabs defaultValue="自动获取">
            <NTabPane name="自动获取" disabled={state.loading}>
              <NButton loading={state.loading} onClick={() => fetchIcon()} disabled={!props.bookmarkUrl}>
                点击获取
              </NButton>
            </NTabPane>
            <NTabPane name="手动输入" disabled={state.loading}>
              <NInputGroup>
                <NInput placeholder="请输入图标地址" onInput={(v) => (state.inputSrc = v)} />
                <NButton
                  loading={state.loading}
                  // disabled={!props.bookmarkUrl}
                  // onClick={() => fetchIcon(state.inputSrc)}
                  disabled={!state.inputSrc}
                  onClick={() => props.setFavicon(state.inputSrc)}
                >
                  确定
                </NButton>
              </NInputGroup>
            </NTabPane>
          </NTabs>
        )}
      </>
    )
  },
})
