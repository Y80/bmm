import { Assets } from '@cfg'
import { Link } from '@nextui-org/react'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="grow flex-col gap-4 text-foreground-500 flex-center">
      <Image src={Assets.LOGO_SVG} width={64} height={64} alt="logo" />
      <h1 className="mt-6 text-3xl text-foreground-900">对不起，您不具备管理员权限</h1>
      <h3>
        如果您是网站开发者，请参考 &nbsp;
        <Link target="_blank" href="/">
          项目文档
        </Link>
        &nbsp; 进行身份配置
      </h3>
      <h3>
        如果您是访客，可点击<Link href="/">&nbsp;返回首页</Link>
      </h3>
    </div>
  )
}
