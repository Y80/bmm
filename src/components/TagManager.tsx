import { Plus } from '@vicons/tabler'
import {
  NDataTable,
  NButton,
  NSpace,
  NPopconfirm,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NDrawer,
  NDrawerContent,
  FormInst,
  NSpin,
  NIcon,
} from 'naive-ui'
import { TableColumn } from 'naive-ui/lib/data-table/src/interface'
import { defineComponent, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import TagAPI from '../api/tag'
import { ITag } from '../interface'

export default defineComponent({
  props: {
    show: { required: true, type: Boolean },
    onClose: { required: true, type: Function },
  },

  setup(props) {
    const store = useStore()
    const formRef = ref<FormInst>()
    const state = reactive({ loading: false })
    const modalState = reactive({
      show: false,
      title: '',
      loading: false,
      tagId: 0,
      formModel: { name: '' },
    })
    const columns: TableColumn<ITag>[] = [
      {
        title: '标签名称',
        key: 'name',
      },
      {
        title: '关联书签数量',
        key: 'bookmarkNum',
      },
      {
        title: '操作',
        key: 'action',
        render(row) {
          return (
            <NSpace>
              <NButton tertiary size="small" onClick={() => openModal(row)}>
                编辑
              </NButton>
              <NPopconfirm
                onPositiveClick={() => {
                  TagAPI.remove(row.id).then(refreshTagData)
                }}
                v-slots={{
                  default: () => `确定要删除标签【${row.name}】吗？`,
                  trigger: () => (
                    <NButton tertiary size="small" type="error">
                      删除
                    </NButton>
                  ),
                }}
              />
            </NSpace>
          )
        },
      },
    ]

    function refreshTagData() {
      state.loading = true
      store.dispatch('getAllTags').finally(() => {
        state.loading = false
      })
    }
    function openModal(data?: ITag) {
      if (data) {
        modalState.formModel.name = data.name
        modalState.title = '编辑标签'
        modalState.tagId = data.id
      } else {
        modalState.formModel.name = ''
        modalState.title = '创建标签'
        modalState.tagId = 0
      }

      modalState.show = true
    }
    async function handleSubmit() {
      if (!formRef.value) throw new Error('form ref 挂载失败')

      await formRef.value.validate()
      modalState.loading = true
      function add() {
        return TagAPI.add(modalState.formModel)
      }
      function update() {
        return TagAPI.update({ ...modalState.formModel, id: modalState.tagId })
      }
      const promise = modalState.tagId ? update() : add()
      promise
        .then(() => {
          refreshTagData()
          modalState.show = false
        })
        .finally(() => {
          modalState.loading = false
        })
    }

    watch(
      () => props.show,
      (value) => {
        if (value) refreshTagData()
      },
    )

    return () => (
      <>
        <NDrawer
          placement="right"
          width={store.state.isMobile ? '100%' : 600}
          show={props.show}
          onUpdateShow={(value) => !value && props.onClose()}
        >
          <NDrawerContent title="标签管理" closable>
            <NSpace align="center" justify="space-between" style={{ marginBottom: '.5em' }}>
              <span>当前有 {store.state.tags?.length || 0} 个标签</span>
              <NButton tertiary type="primary" onClick={() => openModal()}>
                {{
                  default: () => '添加标签',
                  icon: () => (
                    <NIcon>
                      <Plus />
                    </NIcon>
                  ),
                }}
              </NButton>
            </NSpace>
            <NSpin show={state.loading}>
              <NDataTable size="small" columns={columns} data={store.state.tags} />
            </NSpin>
          </NDrawerContent>
        </NDrawer>

        <NModal
          title={modalState.title}
          show={modalState.show}
          preset="confirm"
          positiveText="确认"
          loading={modalState.loading}
          onPositiveClick={handleSubmit}
          onClose={() => (modalState.show = false)}
        >
          <NForm labelPlacement="left" ref={formRef} model={modalState.formModel}>
            <NFormItem label="名称" path="name" rule={{ required: true, message: '请输入标签名称' }}>
              <NInput
                maxlength={15}
                showCount
                v-model={[modalState.formModel.name, 'value']}
                placeholder="请输入标签名称"
              />
            </NFormItem>
          </NForm>
        </NModal>
      </>
    )
  },
})
