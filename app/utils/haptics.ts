export function hapticTick() {
  if ('vibrate' in navigator) navigator.vibrate(15)
}

export function hapticSuccess() {
  if ('vibrate' in navigator) navigator.vibrate([20, 40, 20, 40, 60])
}