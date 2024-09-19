'use client'

import { ComponentProps } from 'react'
import { createRoot } from 'react-dom/client'
import MyModal from '.'

export default function open(props: ComponentProps<typeof MyModal>) {
  const root = createRoot(document.createDocumentFragment())

  function handleClose() {
    props.onClose?.()
    root.render(<MyModal {...props} isOpen={false} />)
    const ANIMATION_DURATION = 300
    setTimeout(() => root.unmount(), ANIMATION_DURATION)
  }

  async function handleOk() {
    if (!props.onOk) return
    const rst = props.onOk({} as any) as any

    if (rst instanceof Promise) {
      try {
        await rst
      } catch (error) {}
    }
    handleClose()
  }

  root.render(<MyModal {...props} isOpen onClose={handleClose} onOk={handleOk} />)
}
