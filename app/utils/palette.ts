export const TASK_PALETTE = [
  '#ED7A61', // corail
  '#5FA980', // sauge
  '#A14A6E', // prune
  '#D1972E', // moutarde
  '#4C7C9B', // bleu ardoise
]

export function nextColor(index: number): string {
return TASK_PALETTE[index % TASK_PALETTE.length] ?? TASK_PALETTE[0]!
}