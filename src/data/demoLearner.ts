export interface DemoLearner {
  firstName: string
  currentPath: string
  level: number
  xp: number
  stars: number
  questStreak: number
}

export const demoLearner: DemoLearner = {
  firstName: 'Rory',
  currentPath: 'Grade 2 Bridge',
  level: 1,
  xp: 120,
  stars: 8,
  questStreak: 3,
}
