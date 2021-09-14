// TODO: 不同搜索引擎的可用性检测
import {
  NButton,
  NConfigProvider,
  NIcon,
  NInput,
  NPopselect,
  NSpace,
} from 'naive-ui'
import { Search } from '@vicons/tabler'
import { computed, reactive } from 'vue'
import classes from '../style/components/search-bar.module.css'

interface SearchConfigOption {
  value: string
  name: string
  icon: string
  getSearchUrl(question: string): string
}

const searchEngines: SearchConfigOption[] = [
  {
    value: 'baidu',
    name: '百度搜索',
    icon: 'http://cdn.gu13.cn/favicon/www.baidu.com.svg',
    getSearchUrl: (q) => 'https://baidu.com/s?wd=' + encodeURI(q),
  },
  {
    value: 'google',
    name: '谷歌搜索',
    icon: 'http://cdn.gu13.cn/favicon/www.google.com.ico',
    getSearchUrl: (q) => 'https://google.com/search?q=' + encodeURI(q),
  },
  {
    value: 'bing',
    name: '必应搜索',
    icon: 'http://cdn.gu13.cn/favicon/bing.com.ico',
    getSearchUrl: (q) => 'https://bing.com/search?q' + encodeURI(q),
  },
  {
    value: 'stack overflow',
    name: 'Stack Overflow',
    icon: 'http://cdn.gu13.cn/favicon/stackoverflow.com.png',
    getSearchUrl: (q) => 'https://stackoverflow.com/search?q=' + encodeURI(q),
  },
  {
    value: 'npm',
    name: 'npm',
    icon: 'http://cdn.gu13.cn/favicon/www.npmjs.com.png',
    getSearchUrl: (q) => 'https://www.npmjs.com/search?q=' + encodeURI(q),
  },
  {
    value: 'github',
    name: 'Github',
    icon: 'http://cdn.gu13.cn/favicon/github.com.svg',
    getSearchUrl: (q) => 'https://github.com/search?q=' + encodeURI(q),
  },
]

export default function SearchBar() {
  const state = reactive({
    engine: searchEngines[0].value,
    icon: searchEngines[0].icon,
    question: '',
    showPopSelect: false,
  })

  const currentEngineConfig = computed(() => {
    const rst = searchEngines.find((item) => item.value === state.engine)
    if (!rst) throw new Error('搜索配置有误')

    return rst
  })

  function handleChangeEngine(value: string) {
    state.showPopSelect = false
    state.engine = value
    state.icon = searchEngines.find((itme) => itme.value === value)?.icon!
  }

  function handleSearch() {
    window.open(currentEngineConfig.value.getSearchUrl(state.question))
  }

  return (
    <NConfigProvider
      themeOverrides={{
        Popover: { padding: '0', space: '12px' },
        InternalSelectMenu: { optionPaddingMedium: '0 36px 0 12px' },
        Input: { border: 'none', borderRadius: '99px', heightMedium: '1.2em' },
      }}
    >
      <NInput
        class={classes.root}
        style={{ maxWidth: '500px', display: 'flex' }}
        clearable
        placeholder="搜点什么？"
        value={state.question}
        onUpdateValue={(v) => (state.question = v)}
        onKeyup={(keyEvent) => {
          if (keyEvent.key === 'Enter') {
            handleSearch()
          } else if (keyEvent.key === 'Tab') {
            state.showPopSelect = true
          }
        }}
        onBlur={() => (state.question = state.question.trim())}
        v-slots={{
          prefix: () => (
            <NPopselect
              value={state.engine}
              show={state.showPopSelect}
              onUpdateShow={(v) => (state.showPopSelect = v)}
              onUpdateValue={handleChangeEngine}
              trigger="click"
              placement="bottom-start"
              options={searchEngines.map((item) => {
                return {
                  value: item.value,
                  label: () => (
                    <NSpace align="center">
                      <img
                        style={{ display: 'block', width: '24px' }}
                        src={item.icon}
                      />
                      <span>{item.name}</span>
                    </NSpace>
                  ),
                }
              })}
            >
              <img
                src={state.icon}
                style={{ display: 'block', width: '24px', borderRadius: '4px' }}
              />
            </NPopselect>
          ),
          suffix: () => (
            <NButton
              bordered={false}
              size="small"
              type="primary"
              style={{ margin: '0 -6px 0 6px' }}
              round
              onClick={handleSearch}
              v-slots={{
                default: () => '搜索',
                icon: () => (
                  <NIcon style={{ color: 'inherit' }}>
                    <Search />
                  </NIcon>
                ),
              }}
            />
          ),
        }}
      />
    </NConfigProvider>
  )
}
