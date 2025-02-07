import { PropsWithChildren } from 'react'
import style from './style.module.css'

interface Props {
  className?: string
  colors?: string[]
  animationSpeed?: number
  showBorder?: boolean
}

export default function GradientText({
  children,
  className = '',
  colors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'],
  animationSpeed = 8,
  showBorder = false,
}: PropsWithChildren<Props>) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`,
  }

  return (
    <div className={`${style['animated-gradient-text']} ${className}`}>
      {showBorder && <div className={style['gradient-overlay']} style={gradientStyle}></div>}
      <div className={style['text-content']} style={gradientStyle}>
        {children}
      </div>
    </div>
  )
}
