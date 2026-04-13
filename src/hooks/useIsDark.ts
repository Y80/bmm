import { useTheme } from 'next-themes'

export default function useIsDark() {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === 'dark'
}
