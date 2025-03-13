// ! 这里的数据在客户端、服务端都可调用，不要在这里存储敏感数据

/** 网站名称 */
export const WEBSITE_NAME = 'BMM'

export const WEBSITE_KEYWORDS =
  '开源书签管理, AI整理书签, 开发者工具, 网页收藏神器, 跨平台书签同步, 优质网站导航, 书签云管理'

export const IS_DEV = process.env.NODE_ENV === 'development'

export const Background = {
  CLASS: 'light:bg-white dark:bg-slate-950',
  LIGHT_HEX: '#fff',
  LIGHT_CLASS: 'bg-white',
  DARK_HEX: '#020617',
  DARK_CLASS: 'bg-slate-950',
}

export const ApiRoutes = {
  Public: {
    TAG: '/api/public/tag',
    BOOKMARK: '/api/public/bookmark',
    BOOKMARK_LIST: '/api/public/bookmark/list',
  },
  // User: {
  //   TAG: '/api/user/tag',
  //   BOOKMARK: '/api/user/bookmark',
  //   INDEX: '/api/user',
  // },
  Ai: {
    ANALYZE_WEBSITE: '/api/ai/analyze-website',
    ANALYZE_RELATED_TAGS: '/api/ai/analyze-related-tags',
  },
  PARSE_WEBSITE: '/api/parse-website',
} as const

export const PageRoutes = {
  INDEX: '/',
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',
  User: {
    INDEX: '/user',
    SETTINGS: '/user/settings',
    TAG_LIST: '/user/tag/list',
    BOOKMARK_LIST: '/user/bookmark/list',
    UPLOAD: '/user/upload',
    tagSlug: (slug: 'new' | TagId) => '/user/tag/' + slug,
    bookmarkSlug: (slug: 'new' | BookmarkId) => '/user/bookmark/' + slug,
    space(urlOrPath?: string | null) {
      if (!urlOrPath) return false
      if (urlOrPath.startsWith('http') && URL.canParse(urlOrPath)) {
        urlOrPath = new URL(urlOrPath).pathname
      }
      return urlOrPath.startsWith(this.INDEX)
    },
  },
  Admin: {
    PREFIX: '/admin',
    INDEX: '/admin',
    TAG_LIST: '/admin/tag/list',
    BOOKMARK_LIST: '/admin/bookmark/list',
    UPLOAD: '/admin/upload',
    tagSlug: (slug: 'new' | TagId) => '/admin/tag/' + slug,
    bookmarkSlug: (slug: 'new' | BookmarkId) => '/admin/bookmark/' + slug,
    space(urlOrPath?: string | null) {
      if (!urlOrPath) return false
      if (urlOrPath.startsWith('http') && URL.canParse(urlOrPath)) {
        urlOrPath = new URL(urlOrPath).pathname
      }
      return urlOrPath.startsWith(this.INDEX)
    },
  },
  Public: {
    RANDOM: '/random',
    SEARCH: '/search',
    search: (ky: string) => '/search?keyword=' + ky,
  },
} as const

export const IconNames = {
  ARROW_RIGHT: 'icon-[tabler--arrow-right]',
  BOOKMARK: 'icon-[tabler--bookmark]',
  DEVICE_DESKTOP: 'icon-[tabler--device-desktop]',
  EDIT: 'icon-[tabler--edit]',
  EXTERNAL_LINK: 'icon-[tabler--external-link]',
  GITHUB: 'icon-[tabler--brand-github]',
  HOME: 'icon-[tabler--home]',
  IMPORT: 'icon-[hugeicons--file-import]',
  LIST: 'icon-[tabler--list]',
  MOON_STARS: 'icon-[tabler--moon-stars]',
  PLUS: 'icon-[tabler--plus]',
  QUESTION_CIRCLE: 'icon-[mdi--question-mark-circle-outline]',
  UPLOAD: 'icon-[tabler--upload]',
  USER: 'icon-[tabler--user]',
  SEARCH: 'icon-[tabler--search]',
  SORT: 'icon-[tabler--arrows-sort]',
  SORT_ASC: 'icon-[tabler--sort-ascending]',
  SORT_DESC: 'icon-[tabler--sort-descending]',
  STARS: 'icon-[mdi--stars]',
  SIEVE: 'icon-[tabler--dice-3]', // 筛子
  SUN: 'icon-[tabler--sun]',
  TAG: 'icon-[tabler--tag]',
  TRASH: 'icon-[tabler--trash]',
  Huge: {
    SEARCH: 'icon-[hugeicons--search-01]',
    HOME: 'icon-[hugeicons--home-04]',
    IMPORT: 'icon-[hugeicons--file-import]',
    TAG: 'icon-[hugeicons--tag-01]',
    BOOKMARK: 'icon-[hugeicons--all-bookmark]',
    ADD: 'icon-[hugeicons--add-square]',
    LIST: 'icon-[hugeicons--left-to-right-list-dash]',
  },
}

/** 管理后台的导航链接 */
export const ADMIN_NAV_LINKS = [
  { label: '新建书签', href: PageRoutes.Admin.bookmarkSlug('new') },
  { label: '新建标签', href: PageRoutes.Admin.tagSlug('new') },
  { label: '书签列表', href: PageRoutes.Admin.BOOKMARK_LIST },
  { label: '标签列表', href: PageRoutes.Admin.TAG_LIST },
]

export const Assets = {
  BOX_EMPTY_PNG: '/box-empty.png',
  LOGO_SVG: '/logo.svg',
  LOGO_NO_BG_SVG: '/logo-no-bg.svg',
}

export const ExternalLinks = {
  REPO: 'https://github.com/y80/bmm',
} as const

/** 默认情况下每页获取的书签个数；出于栅格布局的考虑这里选用 24 */
export const DEFAULT_BOOKMARK_PAGESIZE = 24
