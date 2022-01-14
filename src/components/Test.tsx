import { defineComponent, reactive } from 'vue'

interface Props {
  count: number
}

export default defineComponent<Props>((props) => {
  return <div class="my-class">count: {props.count}</div>
})
