import { defineComponent, ref, reactive, watch, PropType, computed } from 'vue'
import { FormInst, FormRules, NForm, NFormItem, NIcon, NInput, NModal, NSpace, NTag, useThemeVars } from 'naive-ui'
import { Bookmarks as IconBookmarks } from '@vicons/tabler'
import { IBookmark, ITag } from '../../../interface'
import store from '../../../store'
import BookmarkAPI from '@api/bookmark'
import IconSetter from './IconSetter'

const FORM_RULES: FormRules = {
  name: {
    required: true,
    message: '请输入书签名称',
    trigger: ['blur', 'input'],
  },
  url: {
    required: true,
    message: '请输入书签网址',
    trigger: ['blur', 'input'],
  },
}
const FORM_INITIAL_VALUES = {
  name: '',
  url: '',
  description: '',
  favicon: '',
}

export default defineComponent({
  props: {
    show: {
      required: true,
      type: Boolean,
    },
    dataSource: {
      type: Object as PropType<IBookmark | null>,
    },
    onClose: {
      required: true,
      type: Function as PropType<() => any>,
    },
    onSuccess: {
      required: true,
      type: Function as PropType<(entity: typeof FORM_INITIAL_VALUES & { tagIds: number[] }) => any>,
    },
  },

  setup(props) {
    const state = reactive({
      isEdited: false,
      isSubmitting: false,
      tags: [] as Array<ITag & { checked: boolean }>,
    })
    const formRef = ref<FormInst>()
    const formModel = reactive(Object.assign({}, FORM_INITIAL_VALUES))

    watch(
      () => store.state.tags,
      () => {
        state.tags = store.state.tags.map((tag) => ({ ...tag, checked: false }))
      },
      { immediate: true },
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
          Object.assign(formModel, FORM_INITIAL_VALUES)
          state.tags.forEach((tag) => (tag.checked = false))
        }
      },
    )

    const checkedTags = computed(() => state.tags.filter((tag) => tag.checked))

    async function handleSubmit() {
      if (!formRef.value) return

      await formRef.value.validate()
      state.isSubmitting = true
      const payload = {
        ...formModel,
        tagIds: checkedTags.value.map((tag) => tag.id),
      }
      payload.favicon ||= 'https://cdn.jsdelivr.net/gh/y80/img/favicon/_default.svg'
      const task = state.isEdited
        ? BookmarkAPI.update(Object.assign(payload, { id: props.dataSource?.id! }))
        : BookmarkAPI.add(payload)

      try {
        await task
        props.onClose()
        props.onSuccess(payload)
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
            <IconBookmarks />
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
          rules={FORM_RULES}
          labelPlacement={store.state.isMobile ? 'top' : 'left'}
          labelWidth="80"
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
              bookmarkUrl={formModel.url}
              setFavicon={(value) => {
                console.log(value)
                Reflect.set(formModel, 'favicon', value)
              }}
            />
          </NFormItem>
          <NFormItem label="描述" path="description">
            <NInput type="textarea" v-model={[formModel.description, 'value']} />
          </NFormItem>
          <NFormItem label={`关联标签`} path="tags">
            <div>
              <NSpace
                size="small"
                style={{
                  maxHeight: '125px',
                  overflow: 'auto',
                  borderRadius: '3px',
                  border: '1px solid #e0e0e6',
                  padding: '0 4px 0 6px',
                }}
              >
                {state.tags.map((tag) => (
                  <NTag size="medium" key={tag.name} checkable v-model={[tag.checked, 'checked']}>
                    {tag.name}
                  </NTag>
                ))}
              </NSpace>
              <p v-show={checkedTags.value.length} style={{ color: useThemeVars().value.textColor3 }}>
                已选中：{checkedTags.value.map((tag) => tag.name).join('、')}
              </p>
            </div>
          </NFormItem>
        </NForm>
      </NModal>
    )
  },
})
