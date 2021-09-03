import { NSpace, NSpin } from 'naive-ui'
import { FunctionalComponent } from 'vue'
import classes from '../style/components/bookmark-container.module.css'

interface Props {
  loading: boolean
}

const BookmarkContainer: FunctionalComponent<Props> = (props, { slots }) => {
  return (
    <>
      <NSpace justify="center">
        <NSpin v-show={props.loading} style={{ minHeight: '100px' }} />
      </NSpace>
      <div v-show={!props.loading} class={classes.bookmarkContainer}>
        {slots.default?.()}
      </div>
    </>
  )
}

export default BookmarkContainer
