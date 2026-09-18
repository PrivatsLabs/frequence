export function spawnRipple(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  if (!el) return
  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 1.6
  const ripple = document.createElement('span')
  ripple.className = 'ripple-el'
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`
  el.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}