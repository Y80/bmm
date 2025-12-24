import { cn, Input, InputProps } from '@heroui/react'

interface Props extends InputProps {}

export default function ReInput(props: Props) {
  return (
    <Input
      placeholder=" "
      labelPlacement="outside"
      autoComplete="off"
      {...props}
      value={props.value === null ? '' : props.value}
      classNames={{
        ...props.classNames,
        input: cn('outline-hidden', props.classNames?.input),
      }}
    />
  )
}
