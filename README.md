## 项目部署

### 方式一: git 拉取部署

1. git clone 项目

2. `pnpm install` 安装依赖

3. .env 配置环境变量 `DB_CONNECTION_URL`

4. 执行 `pnpm db:migrate`，创建数据表

如果数据库链接异常，这一步会执行失败。

5. `pnpm dev` 启动项目

### 方式二：部署至 Vercel

准备内容：PostgreSQL 数据库连接 URL、Github OAuth 密钥对

1. fork 当前 Github 仓库

2. 登入 [Vercel](https://vercel.com/)，将 Github 仓库访问权限授权给 Vercel

3. 在当前项目下的 Settings/Environment Variables 中配置：
  - DB_CONNECTION_URL
  - AUTH_GITHUB_SECRET
  - AUTH_GITHUB_ID

### 方式三：使用 Docker 部署

使用这种方式部署时，必须提供 Github OAuth 密钥对，而对于 PostgreSQL 数据库连接 URL 有没有都行。

**因为如果不提供数据库连接 URL，将会使用 Docker 自行部署一个 PostgreSQL 数据库服务。**


## 图标

当前项目安装了两个图标集合：

- `Table Icons` 对应的 npm 包：@iconify-json/tabler
- `Material Design Icons` 对应的 npm 包：@iconify-json/mdi

搭配 `@iconify/tailwind` Tailwind 插件，通过类名即可直接引用图标，例如：

```html
<span class="icon-[tabler--check]" />
```

对于会多处使用到的图标，可以将类名单独存放在 `@cfg:IconNames` 中，然后用在标签上即可，如 `<span className={IconNames.EDIT} />`。

## 功能

- 书签关键词搜索
- 标签过滤、切换「仅展示主标签」
- 根据标签筛选书签
- 管理员使用 Github 授权登录
- 完整的后台管理
  - [x] 标签、书签的增删改查
  - [x] 标签间的相互关联
  - [x] 标签和书签的相互关联
  - [x] 标签排序
  - [x] 导入浏览器导出的书签
- 书签置顶
- 用户系统
- 定期检测网站可用性

## 给网站打标签的基本原则

- 根据网站的属性、类型打标签，而非网站的功能点。因为网站的功能点可能会很多、很碎，没必要为每个功能点都打上标签。

- 标签允许包含广义含义的标签，如「云服务」是囊括了「云函数」的。但是如果一个网站主要内容是提供「云函数」服务，就无须再为它打上「云服务」标签。只需要让「云服务」和「云函数」标签互为关联标签即可。

## 接入 AI 服务

本项目通过 AI 实现了 **分析总结网站、给网站打标签、分析相关联的标签** 的功能，可大大减少维护书签数据的工作量。

由于目前 AI 服务商众多，且不同服务商提供的 API 格式并不相同，因此这里会有轻微的编码工作。

下面是使用 [字节跳动-扣子](https://www.coze.cn/docs/developer_guides/coze_api_overview) AI 能力的示例：

```ts
// @/lib/ai/servers

export const getServer = coze

function coze() {
  if (!env.COZE_API_KEY || !env.COZE_BOT_ID) {
    throw new Error('请配置环境变量 COZE_API_KEY、COZE_BOT_ID')
  }
  return {
    responseContentPath: 'messages[0].content',
    sendRequest(query: string) {
      return commonFetch({
        url: 'https://api.coze.cn/open_api/v2/chat',
        token: process.env.COZE_API_KEY!,
        body: {
          bot_id: process.env.COZE_BOT_ID,
          user: 'user',
          query,
          stream: false,
        },
      })
    },
  }
}
```

`@/lib/ai/servers` 提供了使用 扣子 和 OpenAI 的代码示例可供参考。


