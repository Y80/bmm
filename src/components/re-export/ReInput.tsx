import { Input, InputProps } from '@nextui-org/react'

interface Props extends InputProps {}

export default function ReInput(props: Props) {
  return <Input placeholder=" " labelPlacement="outside" autoComplete="off" {...props} />
}
