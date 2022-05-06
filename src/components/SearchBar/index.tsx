// TODO: 不同搜索引擎的可用性检测

import { NButton, NIcon, NInput, NPopselect, NSpace } from 'naive-ui'
import { Search as SearchIcon } from '@vicons/tabler'
import { SearchEngines } from './engines'
import { computed, defineComponent, reactive, watch } from 'vue'
import styles from './styles.module.css'
import logo from '../../../public/favicon.png'
import { useScroll } from '@vueuse/core'

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

  const scrollData = reactive(useScroll(document))

  watch(
    () => scrollData.isScrolling,
    (value) => {
      if (value) return

      const { y } = scrollData
      if (y < 150) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (y >= 150 && y < 320) {
        window.scrollTo({ top: 320, behavior: 'smooth' })
      }
    },
  )

  const scaleValue = computed(() => {
    let value = 1
    if (scrollData.y > 320) {
      value = 0.2
    } else {
      value = (320 - scrollData.y) * (100 / 32000)
      value = value < 0.2 ? 0.2 : value
    }

    return value
  })

  return () => (
    <div class={styles.searchBar} style={{ height: '320px' }}>
      <div style={{ transform: `scale(${scaleValue.value})` }}>
        <div class={styles.brand}>
          <img src={logo} width="64" style={{ marginRight: '8px' }} />
          <h1 style={{ color: 'white' }}>BMM</h1>
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
          themeOverrides={{
            borderRadius: '8px',
            heightMedium: '2rem',
            fontSizeMedium: '1.25rem',
            boxShadowFocus: '0 0 0 9999px hsla(0, 0%, 30%, 0.50)',
            border: 'none',
            borderFocus: 'none',
            borderHover: 'none',
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
                    <NSpace align="center" size="large">
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
      </div>
    </div>
  )
})
