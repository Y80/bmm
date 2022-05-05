// TODO: 不同搜索引擎的可用性检测

import { NButton, NConfigProvider, NIcon, NInput, NPopselect, NSpace } from 'naive-ui'
import { Search as SearchIcon } from '@vicons/tabler'
import { SearchEngines } from './engines'
import { computed, defineComponent, onMounted, reactive } from 'vue'
import classes from './styles.module.css'
import logo from '../../../public/favicon.png'

function throttle(fn: (...args: any[]) => void, wait: number = 100) {
  let timerId: any
  return (...args: any[]) => {
    if (!timerId) {
      timerId = setTimeout(() => {
        fn(...args)
      }, wait)
    } else {
      clearTimeout(timerId)
      timerId = setTimeout(() => {
        fn(...args)
      }, wait)
    }
  }
}

export default defineComponent(() => {
  const state = reactive({
    engine: SearchEngines[0].value,
    icon: SearchEngines[0].icon,
    question: '',
    showPopSelect: false,
  })

  const currentEngineConfig = computed(() => {
    const rst = SearchEngines.find((item) => item.value === state.engine)
    if (!rst) throw new Error('搜索配置有误')

    return rst
  })

  function handleChangeEngine(value: string) {
    state.showPopSelect = false
    state.engine = value
    state.icon = SearchEngines.find((item) => item.value === value)?.icon!
  }

  function handleSearch() {
    window.open(currentEngineConfig.value.getSearchUrl(state.question))
  }

  onMounted(() => {
    window.addEventListener(
      'scroll',
      throttle(() => {
        const { scrollY } = window
        if (scrollY > 120 && scrollY < 300) {
          window.scrollTo({ top: 300, behavior: 'smooth' })
        }
      })
    )
  })

  return () => (
    <NConfigProvider
      themeOverrides={{
        Popover: { padding: '0', space: '12px' },
        InternalSelectMenu: { optionPaddingMedium: '0 36px 0 12px' },
        Input: {
          borderRadius: '8px',
          heightMedium: '2rem',
          fontSizeMedium: '1.25rem',
          boxShadowFocus: '0 0 0 9999px hsla(0, 0%, 30%, 0.50)',
          border: 'none',
          borderFocus: 'none',
          borderHover: 'none',
        },
      }}
      class={classes.searchBar}
    >
      <div class={classes.brand}>
        <img src={logo} width="64" style={{ marginRight: '8px' }} />
        <h1>BMM</h1>
      </div>
      <NInput
        clearable
        placeholder="搜点什么？"
        value={state.question}
        onUpdateValue={(v) => Reflect.set(state, 'question', v)}
        onKeyup={(keyEvent) => {
          if (keyEvent.key === 'Enter') {
            handleSearch()
          } else if (keyEvent.key === 'Tab') {
            state.showPopSelect = true
          }
        }}
        onBlur={() => Reflect.set(state, 'question', state.question.trim())}
        v-slots={{
          prefix: () => (
            <NPopselect
              value={state.engine}
              show={state.showPopSelect}
              onUpdateShow={(v) => (state.showPopSelect = v)}
              onUpdateValue={handleChangeEngine}
              trigger="click"
              placement="bottom-start"
              options={SearchEngines.map((item) => ({
                value: item.value,
                label: () => (
                  <NSpace align="center">
                    <img style={{ display: 'block', width: '24px' }} src={item.icon} />
                    <span>{item.name}</span>
                  </NSpace>
                ),
              }))}
            >
              <img
                src={state.icon}
                style={{ display: 'block', width: '24px', borderRadius: '4px', cursor: 'pointer' }}
              />
            </NPopselect>
          ),
          suffix: () => (
            <NButton
              bordered={false}
              type="primary"
              style={{ margin: '0 -6px 0 6px' }}
              themeOverrides={{}}
              round
              onClick={handleSearch}
              v-slots={{
                default: () => '搜索',
                icon: () => (
                  <NIcon color="white">
                    <SearchIcon />
                  </NIcon>
                ),
              }}
            />
          ),
        }}
      />
    </NConfigProvider>
  )
})
