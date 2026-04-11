// ! 这里的数据在客户端、服务端都可调用，不要在这里存储敏感数据

/** 网站名称 */
export const WEBSITE_NAME = process.env.NEXT_PUBLIC_WEBSITE_NAME || 'BMM'

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
  Public: {
    INDEX: '/',
    WELCOME: '/welcome',
    RANDOM: '/random',
    SEARCH: '/search',
    tags: (tagNames?: SelectTag['name'][]) => '/tags/' + (tagNames ? tagNames.join('+') : ''),
    search: (ky: string) => '/search?keyword=' + ky,
  },
  Admin: {
    PREFIX: '/admin',
    INDEX: '/admin',
    UPLOAD: '/admin/upload',
    tagSlug: (slug?: 'new' | TagId | 'list') => '/admin/tag/' + (slug || ''),
    bookmarkSlug: (slug: 'new' | 'list' | BookmarkId) => '/admin/bookmark/' + slug,
  },
  User: {
    INDEX: '/user',
    SETTINGS: '/user/settings',
    UPLOAD: '/user/upload',
    tags: (tagNames?: SelectTag['name'][]) => '/user/tags/' + (tagNames ? tagNames.join('+') : ''),
    tagSlug: (slug?: 'new' | TagId | 'list') => '/user/tag/' + (slug || ''),
    bookmarkSlug: (slug?: 'new' | 'list' | BookmarkId) => '/user/bookmark/' + (slug || ''),
    WELCOME: '/user/welcome',
    RANDOM: '/user/random',
    SEARCH: '/user/search',
    search: (ky: string) => '/user/search?keyword=' + ky,
  },
} as const

export const IconNames = {
  Tabler: {
    API: 'icon-[tabler--api]',
    ALERT_CIRCLE: 'icon-[tabler--alert-circle]',
    ALERT_TRIANGLE: 'icon-[tabler--alert-triangle]',
    ARROWS_MOVE_VERTICAL: 'icon-[tabler--arrows-move-vertical]',
    ARROWS_SORT: 'icon-[tabler--arrows-sort]',
    ARROW_BACK: 'icon-[tabler--arrow-back]',
    ARROW_BACK_UP: 'icon-[tabler--arrow-back-up]',
    ARROW_LEFT: 'icon-[tabler--arrow-left]',
    ARROW_RIGHT: 'icon-[tabler--arrow-right]',
    BOOKMARK: 'icon-[tabler--bookmark]',
    BRAND_GITHUB: 'icon-[tabler--brand-github]',
    CHECK: 'icon-[tabler--check]',
    USER: 'icon-[tabler--user]',
    DASHBOARD: 'icon-[tabler--layout-dashboard]',
    DEVICE_DESKTOP: 'icon-[tabler--device-desktop]',
    DICE_3: 'icon-[tabler--dice-3]',
    DOWNLOAD: 'icon-[tabler--download]',
    EDIT: 'icon-[tabler--edit]',
    EXTERNAL_LINK: 'icon-[tabler--external-link]',
    LOGOUT: 'icon-[tabler--logout-2]',
    EXCLAMATION_CIRCLE: 'icon-[tabler--exclamation-circle]',
    FOLD: 'icon-[tabler--fold]',
    FOLDER: 'icon-[tabler--folder]',
    FOLDER_OPEN: 'icon-[tabler--folder-open]',
    HOME: 'icon-[tabler--home]',
    LIST: 'icon-[tabler--list]',
    LOADER: 'icon-[tabler--loader]',
    LOADER_2: 'icon-[tabler--loader-2]',
    MOON_STARS: 'icon-[tabler--moon-stars]',
    PLUS: 'icon-[tabler--plus]',
    QUESTION_MARK: 'icon-[tabler--question-mark]',
    SEARCH: 'icon-[tabler--search]',
    SORT_ASC: 'icon-[tabler--sort-ascending]',
    SORT_DESC: 'icon-[tabler--sort-descending]',
    STAR_FILLED: 'icon-[tabler--star-filled]',
    SUN: 'icon-[tabler--sun]',
    TAG: 'icon-[tabler--tag]',
    TRASH: 'icon-[tabler--trash]',
    UPLOAD: 'icon-[tabler--upload]',
    X: 'icon-[tabler--x]',
  },
  Huge: {
    FILE: 'icon-[hugeicons--file-01]',
    SEARCH: 'icon-[hugeicons--search-01]',
    HOME: 'icon-[hugeicons--home-04]',
    IMPORT: 'icon-[hugeicons--file-import]',
    INTERNET: 'icon-[hugeicons--internet]',
    TAG: 'icon-[hugeicons--tag-01]',
    BOOKMARK: 'icon-[hugeicons--all-bookmark]',
    ADD_SQUARE: 'icon-[hugeicons--add-square]',
    ADD: 'icon-[hugeicons--add-01]',
    LIST: 'icon-[hugeicons--left-to-right-list-dash]',
    SETTINGS: 'icon-[hugeicons--settings-05]',
  },
  Mdi: {
    GITHUB: 'icon-[mdi--github]',
    IMAGE_REMOVE_OUTLINE: 'icon-[mdi--image-remove-outline]',
    QUESTION_CIRCLE: 'icon-[mdi--question-mark-circle-outline]',
    STARS: 'icon-[mdi--stars]',
    WEB: 'icon-[mdi--web]',
  },
} as const

/** 管理后台的导航链接 */
export const ADMIN_NAV_LINKS = [
  { label: '新建书签', href: PageRoutes.Admin.bookmarkSlug('new') },
  { label: '新建标签', href: PageRoutes.Admin.tagSlug('new') },
  { label: '书签列表', href: PageRoutes.Admin.bookmarkSlug('list') },
  { label: '标签列表', href: PageRoutes.Admin.tagSlug('list') },
]

export const Assets = {
  BOX_EMPTY_PNG: '/box-empty.png',
  LOGO_SVG: process.env.NEXT_PUBLIC_WEBSITE_LOGO || '/logo.svg',
}

export const ExternalLinks = {
  REPO: 'https://github.com/Y80/bmm',
} as const

/** 默认情况下每页获取的书签个数；出于栅格布局的考虑它应该是 3 4 的公倍数 */
export const DEFAULT_BOOKMARK_PAGESIZE = 3 * 4 * 20
export const DEFAULT_PUBLIC_TAG_PAGESIZE = 3 * 4 * 50

export const FieldConstraints = {
  MaxLen: {
    DEFAULT: 100,
    TAG_NAME: 20,
    BOOKMARK_NAME: 50,
    URL: 1000,
    BOOKMARK_DESC: 200,
  },
} as const
