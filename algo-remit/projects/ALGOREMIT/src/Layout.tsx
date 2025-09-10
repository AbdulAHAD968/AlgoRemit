// Layout.tsx
import LocomotiveScroll from 'locomotive-scroll'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const scrollInstance = useRef<InstanceType<typeof LocomotiveScroll> | null>(null)

  useEffect(() => {
    if (scrollRef.current && !scrollInstance.current) {
      scrollInstance.current = new LocomotiveScroll({
        el: scrollRef.current,
        smooth: true,
        lerp: 0.08, // inertia
        multiplier: 1.1,
        smartphone: { smooth: true },
        tablet: { smooth: true },
      })
    }

    // refresh on route change
    scrollInstance.current?.update()
  }, [location.pathname])

  return (
    <div ref={scrollRef} data-scroll-container>
      {children}
    </div>
  )
}
