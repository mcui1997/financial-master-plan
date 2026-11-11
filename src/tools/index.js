import { CompoundTool, EmergencyTool, FeesTool, InflationTool, SavingsRateTool } from './simple.jsx'
import { CrashTool, MixTool, NextDollarTool, PaycheckTool, RebalanceTool, RetirementTool } from './plan.jsx'

// Every tool, in the order shown on the Tools page.
export const TOOLS = [
  { id: 'next-dollar', title: 'Your next dollar', blurb: 'Check off what you have done. See exactly where your next dollar should go.', group: 'Plan', chapter: 'order-of-money', Component: NextDollarTool },
  { id: 'mix', title: 'Mix builder', blurb: 'Set your age and comfort. Get your target mix.', group: 'Plan', chapter: 'your-mix', Component: MixTool },
  { id: 'paycheck', title: 'Paycheck splitter', blurb: 'Turn what you invest each payday into dollars per fund.', group: 'Plan', chapter: 'buying', Component: PaycheckTool },
  { id: 'rebalance', title: 'Rebalance calculator', blurb: 'Enter what you hold. See what to buy or sell, or how to steer new money.', group: 'Plan', chapter: 'rebalancing', Component: RebalanceTool },
  { id: 'retirement', title: 'Retirement planner', blurb: 'Will your money last? See a range, your FI number, and a stress test.', group: 'Plan', chapter: 'retirement', Component: RetirementTool },
  { id: 'crash', title: 'Crash simulator', blurb: 'Run your mix through 2008, 2020, and 2022.', group: 'Plan', chapter: 'crashes', Component: CrashTool },
  { id: 'savings-rate', title: 'Savings rate', blurb: 'What comes in, what goes out, and what is left to save.', group: 'Basics', chapter: 'know-your-numbers', Component: SavingsRateTool },
  { id: 'emergency', title: 'Emergency fund', blurb: 'How big your cushion should be, and how long it will take.', group: 'Basics', chapter: 'safety-first', Component: EmergencyTool },
  { id: 'inflation', title: 'Inflation calculator', blurb: 'What your cash will really be worth in the future.', group: 'Basics', chapter: 'why-cash-loses-value', Component: InflationTool },
  { id: 'compound', title: 'Compound growth', blurb: 'Watch small, steady amounts grow over time.', group: 'Basics', chapter: 'compounding', Component: CompoundTool },
  { id: 'fees', title: 'Fee drag', blurb: 'What a 1% fee really costs over decades.', group: 'Basics', chapter: 'buying', Component: FeesTool },
]

export function toolById(id) {
  return TOOLS.find((t) => t.id === id)
}
