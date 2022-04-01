interface SearchConfigOption {
  value: string
  name: string
  icon: string
  getSearchUrl(question: string): string
}

export const SearchEngines: SearchConfigOption[] = [
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
  {
    value: 'MDN',
    name: 'MDN Web Docs',
    icon: 'http://cdn.gu13.cn/favicon/developer.mozilla.org.png',
    getSearchUrl: (q) => 'https://developer.mozilla.org/zh-CN/search?q=' + encodeURI(q),
  },
  {
    value: '维基百科',
    name: 'wikipedia',
    icon: 'http://cdn.gu13.cn/favicon/zh.wikipedia.org.png',
    getSearchUrl: (q) => 'https://zh.wikipedia.org/w/index.php?search=' + encodeURI(q),
  },
]
