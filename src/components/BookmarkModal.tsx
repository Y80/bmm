import {
  FormInst,
  FormRules,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NSpace,
  NTag,
  NTabs,
  NTabPane,
  NButton,
  NInputGroup,
} from 'naive-ui'
import { defineComponent, ref, reactive, watch, PropType } from 'vue'
import { IBookmark, ITag } from '../interface'
import store from '../store'
import BookmarkAPI from '../api/bookmark'
import { Bookmarks, Trash } from '@vicons/tabler'

const iconApiPrefix = 'https://favicon-finder.aliyun-api.workers.dev/'
const proxyApiPrefix = 'https://proxy.aliyun-api.workers.dev/?url='
function IconSetter(props: { favicon: string; url: string; setFavicon(value: string): void }) {
  const state = reactive({
    loading: false,
    inputSrc: '',
  })

  async function fetchIcon(iconSrc?: string) {
    let url
    if (iconSrc) {
      url = proxyApiPrefix + iconSrc
    } else {
      const { host } = new URL(props.url)
      if (!host) return window.$message.warning('请先输入网址')
      url = iconApiPrefix + host
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

  return (
    <>
      {props.favicon ? (
        <NSpace align="center">
          <img style={{ display: 'block', width: '24px' }} src={props.favicon} />
          <NButton
            text
            type="error"
            style={{ display: 'block' }}
            onClick={() => props.setFavicon('')}
            v-slots={{ icon: () => <Trash /> }}
          />
        </NSpace>
      ) : (
        <NTabs defaultValue="自动获取">
          <NTabPane name="自动获取">
            <NButton loading={state.loading} onClick={() => fetchIcon()} disabled={!props.url}>
              点击获取
            </NButton>
          </NTabPane>
          <NTabPane name="手动输入">
            <NInputGroup>
              <NInput placeholder="请输入图标地址" onChange={(v) => (state.inputSrc = v)} />
              <NButton loading={state.loading} onClick={() => fetchIcon(state.inputSrc)}>
                确定
              </NButton>
            </NInputGroup>
          </NTabPane>
        </NTabs>
      )}
    </>
  )
}

const formRules: FormRules = {
  name: { required: true, message: '请输入书签名称', trigger: ['blur', 'input'] },
  url: { required: true, message: '请输入书签网址', trigger: ['blur', 'input'] },
}
function getFormInitialValues() {
  return {
    name: '',
    url: '',
    description: '',
    favicon: '',
  }
}

export default defineComponent({
  props: {
    show: {
      required: true,
      type: Boolean,
    },
    dataSource: {
      required: false,
      type: Object as PropType<IBookmark | null>,
    },
    onClose: {
      required: true,
      type: Function as PropType<() => any>,
    },
    onSuccess: {
      required: true,
      type: Function as PropType<() => any>,
    },
  },

  setup(props) {
    const state = reactive({
      isEdited: false,
      isSubmitting: false,
      tags: [] as Array<ITag & { checked: boolean }>,
    })
    const formRef = ref<FormInst>()
    const formModel = reactive(getFormInitialValues())

    watch(
      () => store.state.tags,
      () => {
        state.tags = store.state.tags.map((tag) => ({ ...tag, checked: false }))
      },
      { immediate: true }
    )
    watch(
      () => props.show,
      (show) => {
        if (!show) return
        // 打开了 modal
        if (props.dataSource) {
          state.isEdited = true
          Object.assign(formModel, props.dataSource)
          const linkedTagIds = props.dataSource.tags.map((tag) => tag.id)
          state.tags.forEach((tag) => (tag.checked = linkedTagIds.includes(tag.id)))
        } else {
          state.isEdited = false
          Object.assign(formModel, getFormInitialValues())
          state.tags.forEach((tag) => (tag.checked = false))
        }
      }
    )

    async function handleSubmit() {
      await formRef.value?.validate()
      state.isSubmitting = true
      const payload = {
        ...formModel,
        tagIds: state.tags.filter((tag) => tag.checked).map((tag) => tag.id),
      }
      const promise = state.isEdited
        ? BookmarkAPI.update(Object.assign(payload, { id: props.dataSource?.id! }))
        : BookmarkAPI.add(payload)

      try {
        await promise
        props.onClose()
        props.onSuccess()
      } finally {
        state.isSubmitting = false
      }
    }

    return () => (
      <NModal
        title={state.isEdited ? '编辑书签' : '添加书签'}
        loading={state.isSubmitting}
        show={props.show}
        preset="dialog"
        positiveText="提交"
        icon={() => (
          <NIcon>
            <Bookmarks />
          </NIcon>
        )}
        onPositiveClick={handleSubmit}
        onClose={props.onClose}
        onMaskClick={props.onClose}
        displayDirective="show"
      >
        <NForm
          model={formModel}
          ref={formRef}
          rules={formRules}
          labelPlacement={store.state.isMobile ? 'top' : 'left'}
          labelWidth="70"
        >
          <NFormItem label="网址" path="url">
            <NInput v-model={[formModel.url, 'value']} />
          </NFormItem>
          <NFormItem label="名称" path="name">
            <NInput v-model={[formModel.name, 'value']} />
          </NFormItem>
          <NFormItem label="图标" path="favicon">
            <IconSetter
              favicon={formModel.favicon}
              url={formModel.url}
              setFavicon={(value) => (formModel.favicon = value)}
            />
          </NFormItem>
          <NFormItem label="描述" path="description">
            <NInput type="textarea" v-model={[formModel.description, 'value']} />
          </NFormItem>
          <NFormItem label="关联标签" path="tags">
            <NSpace>
              {state.tags.map((tag) => (
                <NTag key={tag.name} checkable v-model={[tag.checked, 'checked']}>
                  {tag.name}
                </NTag>
              ))}
            </NSpace>
          </NFormItem>
        </NForm>
      </NModal>
    )
  },
})
