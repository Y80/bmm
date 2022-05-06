import { defineComponent, reactive, watch } from 'vue'
import { NButton, NSpace, NEmpty } from 'naive-ui'
import TagManager from '../../components/TagManager'
import TagPool from '../../components/TagPool'
import { BookmarkCard } from '../../components/bookmark'
import { BookmarkModal } from '../../components/bookmark'
import SearchBox from '../../components/SearchBar'
import Layout from '@components/Layout'
import { BookmarkContainer } from '../../components/bookmark'
import { IBookmark } from '../../interface'
import BookmarkAPI from '../../api/bookmark'

const DEFAULT_TAG_ID = 44

export default defineComponent({
  setup() {
    const state = reactive({
      showTagManger: false,
      // 当前选中的标签id
      currentTagId: DEFAULT_TAG_ID as number,
      loading: false,
      // 筛选出来的书签数据源
      bookmarks: [] as IBookmark[],
      bookmarkEditable: false,
    })
    const bookmarkModal = reactive<{
      show: boolean
      dataSource?: IBookmark | null
    }>({
      show: false,
      dataSource: null,
    })

    function getBookmarks() {
      // 不允许获取所有书签
      if (!state.currentTagId) return

      state.loading = true
      BookmarkAPI.query(state.currentTagId)
        .then((data) => {
          state.bookmarks = data
        })
        .finally(() => {
          state.loading = false
        })
    }
    getBookmarks()
    function handleRemoveBookmark(bookmark: IBookmark) {
      const dialog = window.$dialog.create({
        title: '删除书签',
        content: `确定要删除书签【${bookmark.name}】吗？`,
        positiveText: '确定',
        onPositiveClick() {
          dialog.loading = true
          BookmarkAPI.remove(bookmark.id).then(() => {
            getBookmarks()
            dialog.destroy()
          })
          // 点击“确定”后，不立即关闭dialog
          return false
        },
      })
    }
    function openBookmarkModal(dataSource?: IBookmark) {
      bookmarkModal.dataSource = dataSource || null
      bookmarkModal.show = true
    }

    watch(() => state.currentTagId, getBookmarks)

    return () => (
      <>
        <SearchBox />
        <Layout>
          <TagPool
            currentTagId={state.currentTagId}
            onManagerClick={() => (state.showTagManger = true)}
            onTagClick={(tagId) => (state.currentTagId = tagId)}
          />
          <NSpace style={{ marginBottom: '1.5rem' }}>
            <NButton onClick={() => openBookmarkModal()} round>
              {{
                default: () => '添加书签',
              }}
            </NButton>
            {!!state.bookmarks?.length && (
              <NButton round onClick={() => (state.bookmarkEditable = !state.bookmarkEditable)}>
                {state.bookmarkEditable ? '关闭编辑' : '开启编辑'}
              </NButton>
            )}
          </NSpace>
          <BookmarkContainer loading={state.loading}>
            {state.bookmarks.map((bookmark) => (
              <BookmarkCard
                editable={state.bookmarkEditable}
                key={bookmark.id}
                dataSource={bookmark}
                onEdit={openBookmarkModal}
                onRemove={handleRemoveBookmark}
                onTagClick={(tagId) => Reflect.set(state, 'currentTagId', tagId)}
              />
            ))}
          </BookmarkContainer>
          <NEmpty
            v-show={!state.bookmarks.length && !state.loading}
            style={{ marginTop: '5em' }}
            description={
              state.currentTagId ? '当前标签没有关联书签，快去添加吧 🥳' : '请从上方标签池选择你感兴趣的标签'
            }
          />

          <TagManager
            show={state.showTagManger}
            onClose={() => {
              state.showTagManger = false
              getBookmarks()
            }}
          />
          <BookmarkModal
            show={bookmarkModal.show}
            dataSource={bookmarkModal.dataSource}
            onClose={() => (bookmarkModal.show = false)}
            onSuccess={({ tagIds = [] }) => {
              state.currentTagId = tagIds.pop() || state.currentTagId
              getBookmarks()
            }}
          />
        </Layout>
      </>
    )
  },
})
