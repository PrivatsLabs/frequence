export const TASK_PALETTE = [
  '#ED7A61', // corail
  '#5FA980', // sauge
  '#A14A6E', // prune
  '#D1972E', // moutarde
  '#4C7C9B', // bleu ardoise

]

export function nextColor(index: number): string {
  if (index < TASK_PALETTE.length) {
    return TASK_PALETTE[index] ?? TASK_PALETTE[0]!
  }
  // Au-delà de la palette de base, génère une teinte inédite
  // en tournant sur la roue chromatique (golden angle = bonne répartition visuelle)
  const hue = (index * 137.5) % 360
  return `hsl(${hue}, 45%, 55%)`
}