// ! 这里的数据在客户端、服务端都可调用，不要在这里存储敏感数据

/** 网站名称 */
export const WEBSITE_NAME = 'BMM'

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
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',
  User: {
    INDEX: '/user',
    SETTINGS: '/user/settings',
    TAG_INDEX: '/user/tag',
    BOOKMARK_INDEX: '/user/bookmark',
    TAG_SLUG: (slug: 'new' | number) => '/user/tag/' + slug,
    BOOKMARK_SLUG: (slug: 'new' | number) => '/user/bookmark/' + slug,
  },
  Admin: {
    INDEX: '/admin',
    TAG_LIST: '/admin/tag/list',
    BOOKMARK_LIST: '/admin/bookmark/list',
    UPLOAD: '/admin/upload',
    tagSlug: (slug: 'new' | number) => '/admin/tag/' + slug,
    bookmarkSlug: (slug: 'new' | number) => '/admin/bookmark/' + slug,
  },
  Public: {
    SEARCH: '/search',
    search: (ky: string) => '/search?keyword=' + ky,
  },
}

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
  SEARCH: 'icon-[tabler--search]',
  SORT: 'icon-[tabler--arrows-sort]',
  SORT_ASC: 'icon-[tabler--sort-ascending]',
  SORT_DESC: 'icon-[tabler--sort-descending]',
  STARS: 'icon-[mdi--stars]',
  SUN: 'icon-[tabler--sun]',
  TAG: 'icon-[tabler--tag]',
  TRASH: 'icon-[tabler--trash]',
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
}

export const ExternalLinks = {
  REPO: 'https://github.com/y80/bmm',
} as const
