import { WEBSITE_NAME } from '@cfg'
import { Button, Modal, ModalBody, ModalContent } from "@heroui/react"
import { useSetState } from 'ahooks'
import { signIn } from 'next-auth/react'
import Image from 'next/image'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal(props: Props) {
  const [state, setState] = useSetState({ authorizing: false })

  async function nextAuthSignIn() {
    signIn('github')
    setState({ authorizing: true })
  }

  return (
    <Modal backdrop="blur" isOpen={props.isOpen} onClose={props.onClose}>
      <ModalContent>
        <ModalBody className="pt-8">
          <Image src="/logo-no-bg.svg" width={48} height={48} className="inline-block" alt="logo" />
          <div className="text-4xl">欢迎登录 {WEBSITE_NAME}</div>
          <div className="text-gray-400">使用独特的标签系统管理您的书签</div>

          <Button
            color="primary"
            className="mb-12 mt-10"
            size="lg"
            startContent={
              state.authorizing ? null : (
                <span className="icon-[tabler--brand-github-filled] text-lg" />
              )
            }
            onClick={nextAuthSignIn}
            isLoading={state.authorizing}
          >
            Github 授权
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
