<div align="center">
  <img width="120" src="./doc/images/logo.svg">
  <br>
  <h3 style="font-size: 30px">BMM</h3>
  <p>收纳、分享、探索优质网站</p>
  <i>BMM / bookmark master / 你的专属书签管家</i>
</div>

<br>

<div align="center">

  <img alt="PC 端明亮/暗夜主题" src="./doc/images/screenshot-pc-light-dark.webp">

  <img alt="后台管理" src="./doc/images/screenshot-pc-cms-light-dark.png">

  <img width="680" alt="移动端" src="./doc/images/screenshot-mobile.png">

  <img alt="AI 解析网站" width="680" src="./doc/images/screenshot-ai-analyse.gif">

</div>


## ✨ 功能

- [x] 搜索书签、标签
- [x] 根据标签筛选书签
- [x] 支持移动端/桌面端、明亮主题/暗夜主题

后台管理功能：

- [x] 基于 Github OAuth 的身份认证
- [x] 导入浏览器导出的书签
- [x] 标签、书签的增删改查
- [x] 标签间的相互关联
- [x] 标签和书签的相互关联
- [x] 标签排序
- [x] 爬取网站标题、图标、简介
- [x] AI 智能解析网站标题、图标、简介、关联标签
- [x] AI 为标签关联标签
- [x] 多个 API 自动获取网站图标

待实现：

- [ ] 定期检测书签可用性
- [ ] 书签置顶、仅登录用户可见
- [ ] 稍后阅读系统
- [ ] 用户系统

## 🗂️ 目录

- [🍽️ 准备内容](#%EF%B8%8F-准备内容) 
- [🚀 项目部署](#-项目部署)
  - [方式一：Node 项目常规部署](#方式一node-项目常规部署)
  - [方式二：部署至 Vercel](#方式二部署至-vercel)
  - [方式三：使用 Docker 部署](#方式三使用-docker-部署)
- [🤖 接入 AI 服务（可选）](#-接入-ai-服务可选)
- [🤔 常见问题](#-常见问题)

## 🍽️ 准备内容

需要准备的内容包括 **数据库连接 URL** 和 **Github OAuth App 密钥对**，下面分别介绍。

### 数据库连接 URL

BMM 使用 Drizzle ORM 将数据存在 PostgreSQL 数据库中。因此需要准备一个 PostgreSQL 的数据库连接 URL。

如果您已经有的 PostgreSQL 服务，创建一个新的数据库然后准备好连接 URL 即可。

如果没有，这里有一些获取免费 PostgreSQL 云服务的方式：[查看](https://juejin.cn/post/7411047482651951119)。

如果使用 Docker 部署当前项目，将会内部启用一个 PostgreSQL 服务，并自动设置数据库连接 URL。

**数据库连接 URL 需要设置为项目中的环境变量 `DB_CONNECTION_URL`。**

### Github OAuth App

BMM 使用 Github 授权登录，认证管理员身份，因此需要配置 Github OAuth。

<details>
  <summary>
  查看创建步骤
  </summary>

1. 登录您的 Github 账户后，访问 https://github.com/settings/applications/new

2. 依次填写表单内容

<img width="480" src="./doc/images/github-oauth-new.png">

其他内容可随意填写，最重要的是 `Authorization callback URL` 这一项，请保证它和你的项目最终部署的 **线上访问地址** 一致！

3. 创建一个 Client secret

<img width="480" src="./doc/images/github-oauth-new-secret.png">

</details>

Github OAuth App 的 Client ID 和 Client Secret 将分别用作环境变量 `AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET`，填写的 Authorization callback URL 要和环境变量 `AUTH_URL` 保持一致。

## 🚀 项目部署

### 方式一：Node 项目常规部署

1. git clone 项目

```sh
git clone https://github.com/Y80/bmm.git
```

2. **.env** 文件中配置 `DB_CONNECTION_URL`

3. `pnpm install` 安装依赖

4. `pnpm dev` 启动项目

对于开发环境，`AUTH_URL` 可以被自动侦测到，`AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET` 也临时提供了一对可用的配置，因此可暂时跳过配置。

通过 `pnpm build` 构建生产产物时，需要明确配置 `AUTH_URL`、`AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET`。

### 方式二：部署至 Vercel

1. fork 当前 Github 仓库

2. 登入 <a href="https://vercel.com" target="_blank">Vercel</a>，新建项目，并关联 fork 的 Github 仓库

3. 在当前项目下的 Environment Variables 页面中配置环境变量：
`DB_CONNECTION_URL`、`AUTH_URL`、`AUTH_GITHUB_SECRET` 和 `AUTH_GITHUB_ID`。

<details>
  <summary>查看截图</summary>
  
  ![vercel-settings-env](./doc/images/vercel-settings-env.png)

  Vercel 上每个项目都会被自动分配一个域名，如 bmm.vercel.app，如果你最终使用这个域名访问 BMM 服务，那么可以不用配置 `AUTH_URL`，否则必须配置该环境变量。
</details>


4. 在 「Deployments 面板」再重新部署一下即可

### 方式三：使用 Docker 部署

1. git clone 项目

```sh
git clone https://github.com/Y80/bmm.git
```

2. 配置环境变量

**.env** 文件中配置 `AUTH_URL`、`AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET`。

3. 使用 docker compose 运行服务

```sh
docker compose up -d
```

数据库文件已创建 docker volumes，名称为 **bmm_postgres_data**，你可以通过 `pg_dump` 备份数据库。

## 🤖 接入 AI 服务（可选）

本项目通过 AI 实现了 **分析总结网站、给网站打标签、分析相关联的标签** 的功能，可大大减少维护书签数据的工作量。

由于目前 AI 服务商众多，且不同服务商提供的 API 并不相同，因此这里会有轻微的编码工作。

下面是使用 [字节跳动-扣子](https://www.coze.cn/docs/developer_guides/coze_api_overview) AI 能力的示例：

```ts
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

`src/lib/ai/servers.ts` 文件提供了使用 **扣子** 和 **OpenAI** 的代码示例可供参考。

> 配置环境变量注意敏感数据泄露！不同的环境可以配置不同的环境变量！更多内容可参考 [.env](./.env)

## 🤔 常见问题

<details>
  <summary>
    如何设置环境变量 AUTH_URL 和 Github 中的 Authorization callback URL?
  </summary>

  首先需要明确， `AUTH_URL` 和 Github OAuth App 中的 Authorization callback URL 是要一致的，用于指定用户在 Github 确认授权后，浏览器需要重定向的服务器地址。

  它们的值如何设定，简单来说，通过什么地址访问 BMM 服务，就把该地址作为它们的值，例如：

  - http://localhost:3000 - 本地开发
  - https://bmm.vercel.app - 部署到 Vercel 的平台上，使用 Vercel 为你分配的域名
  - https://example.com - 用 nginx 代理了本机地址，线上通过域名访问服务
  - http://10.1.2.3:3000 - 线上通过 IP:PORT 直接访问服务
  
</details>


<details>
  <summary>
    Github 登录失败：redirect_uri 错误
  </summary>

如果在 Github 授权之后出现如下错误提示：

![github-redirect-uri-error](./doc/images/github-redirect-uri-err.png)

这表示授权之后 Github 需要跳转的地址和 [Github:OAuth Apps](https://github.com/settings/developers) 中的配置不一致。

**请保证下方配置的 Authorization callback URL 和你访问的域名地址、 `AUTH_URL` 一致。**

![github-oauth-cb-url](./doc/images/github-oauth-cb-url.png)

</details>


<details>
  <summary>
    支持其他数据库吗？
  </summary>

  由于 `drizzle-orm` 除了支持 PostgreSQL，还支持 MySQL 和 SQLite，因此对项目做少许编码改造，即可切换数据库。
</details>

