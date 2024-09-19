import {
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from '@nextui-org/react'
import clsx from 'clsx'
import open from './open'

export interface MyModalProps extends ModalProps {
  iconName?: string
  title?: string
  /** 是否让内容居中 */
  center?: boolean
  onOk?: (...args: any[]) => any
  okButtonProps?: ButtonProps
}

/** 基于 NextUI-Modal 二次封装的弹窗 */
export default function MyModal(props: MyModalProps) {
  const { onOk, iconName, title, center, okButtonProps, ...modalProps } = props

  return (
    <Modal backdrop="blur" {...modalProps}>
      <ModalContent>
        {(onClose) => {
          return (
            <>
              <ModalHeader>{props.title}</ModalHeader>
              <ModalBody className={clsx({ 'items-center': props.center })}>
                {props.children}
              </ModalBody>
              <ModalFooter className="max-xs:px-4">
                {onOk && (
                  <Button
                    fullWidth
                    onClick={onOk}
                    {...okButtonProps}
                    className={clsx('mx-0 w-[33.3%]', okButtonProps?.className)}
                  >
                    确 认
                  </Button>
                )}
              </ModalFooter>
            </>
          )
        }}
      </ModalContent>
    </Modal>
  )
}

MyModal.open = open
