// Chapter list, short versions, and "check yourself" questions.
// The chapter text itself lives in ./chapters/<id>.md

const bodies = import.meta.glob('./chapters/*.md', { query: '?raw', import: 'default', eager: true })

const META = [
  {
    id: 'start-here',
    title: 'Start here',
    part: 'Foundations',
    minutes: 4,
    short: [
      'This site gives you one simple plan you can follow for life.',
      'Buy a little every payday. Tidy up once a year. Change the mix as you get older.',
      'It is for learning, not personal advice. You make the final calls.',
    ],
    quiz: [
      {
        q: 'What is the core of this plan?',
        options: ['Picking the next hot stock', 'Buying a set mix steadily and tidying it once a year', 'Waiting for a crash, then buying'],
        answer: 1,
        why: 'The plan is boring on purpose. A simple routine you keep beats a clever one you quit.',
      },
    ],
  },
  {
    id: 'why-cash-loses-value',
    title: 'Why cash loses value',
    part: 'Foundations',
    minutes: 5,
    short: [
      'Prices rise a little every year. That is inflation.',
      'Cash that just sits there buys less and less over time.',
      'Keep cash for emergencies and near-term needs. Invest the rest.',
    ],
    quiz: [
      {
        q: 'Prices rise 3% a year for 20 years. What happens to $10,000 kept in a drawer?',
        options: ['It buys about the same', 'It buys a lot less, a bit more than half as much', 'It grows to about $18,000'],
        answer: 1,
        why: 'The bills stay the same, but each one buys less. At 3% a year, $10,000 buys what about $5,500 buys today.',
      },
      {
        q: 'So should you hold zero cash?',
        options: ['Yes, invest every dollar', 'No, cash has real jobs: emergencies and money you need soon'],
        answer: 1,
        why: 'Cash is a tool. It is bad at growing, but great at being there when you need it.',
      },
    ],
  },
  {
    id: 'compounding',
    title: 'The power of compounding',
    part: 'Foundations',
    minutes: 5,
    short: [
      'Compounding means your gains start earning gains of their own.',
      'Time matters more than the amount. Starting early is the biggest edge you have.',
      'Small, steady amounts add up to large sums over decades.',
    ],
    quiz: [
      {
        q: 'Who likely ends up with more at 65?',
        options: ['Ana: $300 a month from age 25 to 35, then stops', 'Ben: $300 a month from age 35 to 65'],
        answer: 0,
        why: 'At a 7% yearly return, Ana ends up with about $420,000 and Ben with about $365,000. Ana put in $36,000. Ben put in $108,000. Ana had more time.',
      },
    ],
  },
  {
    id: 'know-your-numbers',
    title: 'Know your numbers',
    part: 'Getting ready',
    minutes: 6,
    short: [
      'You need three numbers: what comes in, what must go out, and what you choose to spend.',
      'Your savings rate is the share of take-home pay you keep.',
      'Aim for 15% or more over time. Any amount is a good start.',
    ],
    quiz: [
      {
        q: 'Which income number matters for a budget?',
        options: ['Your salary on your offer letter', 'Your take-home pay that lands in your bank account'],
        answer: 1,
        why: 'You can only spend or save what actually arrives after taxes and deductions.',
      },
    ],
  },
  {
    id: 'safety-first',
    title: 'Safety first: emergency fund and debt',
    part: 'Getting ready',
    minutes: 8,
    short: [
      'Build a small cushion first, then clear expensive debt, then a full emergency fund.',
      'Keep 3 to 6 months of must-pay costs in a high-yield savings account.',
      'Debt above about 8% interest is a guaranteed loss. Pay it off before investing more.',
    ],
    quiz: [
      {
        q: 'Where should your emergency fund live?',
        options: ['In stocks so it grows', 'In a high-yield savings account', 'In Bitcoin'],
        answer: 1,
        why: 'Emergencies often come with bad markets, like a layoff in a recession. The money has to be there in full, right away.',
      },
      {
        q: 'You have a credit card at 24% interest. What beats paying it off?',
        options: ['Investing in stocks', 'Almost nothing'],
        answer: 1,
        why: 'Paying off a 24% card is a guaranteed 24% return. No investment reliably beats that.',
      },
    ],
  },
  {
    id: 'order-of-money',
    title: 'The order for every dollar',
    part: 'Getting ready',
    minutes: 10,
    short: [
      'Different accounts get different tax breaks. The order you fill them matters.',
      'Free money first (the employer match), then expensive debt, then tax-advantaged accounts.',
      'A regular brokerage account comes last, once the others are full.',
    ],
    quiz: [
      {
        q: 'Your employer matches 401(k) savings up to 4% of pay. What should you put in, at a minimum?',
        options: ['0%, you will start later', '4%, so you get the full match', '1%'],
        answer: 1,
        why: 'The match is an instant 100% return on that money. Skipping it leaves part of your pay on the table.',
      },
      {
        q: 'What is the main difference between Roth and traditional accounts?',
        options: ['Roth pays tax now and is tax-free later. Traditional saves tax now and is taxed later.', 'Roth accounts can only hold cash'],
        answer: 0,
        why: 'Both grow the same way. The difference is when you pay the tax.',
      },
    ],
  },
  {
    id: 'asset-jobs',
    title: 'Every asset has a job',
    part: 'The plan',
    minutes: 12,
    short: [
      'Grow: stocks and a small slice of Bitcoin. They build wealth over decades.',
      'Hedge: gold and real estate. They help when inflation or money printing hurts other assets.',
      'Protect: bonds and cash. They keep you steady and pay the bills in retirement.',
    ],
    quiz: [
      {
        q: 'Which asset is the main engine of long-term growth in this plan?',
        options: ['Gold', 'Stocks', 'Bonds'],
        answer: 1,
        why: 'Stocks are pieces of real businesses that grow their profits. Over long periods they have grown the most.',
      },
      {
        q: 'Why does the plan cap Bitcoin at a small slice?',
        options: ['It can drop 75% or more, and a small slice keeps that survivable', 'It never goes up'],
        answer: 0,
        why: 'Bitcoin has big upside and big crashes. A small slice lets you take part without risking the whole plan.',
      },
    ],
  },
  {
    id: 'your-mix',
    title: 'Your mix: one dial',
    part: 'The plan',
    minutes: 8,
    short: [
      'Your life stage sets your mix. The closer to retirement, the more you hold in bonds and cash.',
      'The hedge slice (gold and REITs) stays about the same at every stage.',
      'Money you need within 5 years does not belong in the mix. Keep it in cash.',
    ],
    quiz: [
      {
        q: 'You are saving for a house down payment in 3 years. Where does that money go?',
        options: ['Your stock-heavy mix', 'Cash or T-bills'],
        answer: 1,
        why: 'Stocks can fall 30% in a year and take years to recover. Money needed soon should not ride that out.',
      },
    ],
  },
  {
    id: 'buying',
    title: 'Buying: a little every payday',
    part: 'The plan',
    minutes: 8,
    short: [
      'Invest a set amount on a set schedule. This is called dollar cost averaging.',
      'Automate it so it happens without you.',
      'Use low-cost index funds. Fees matter more than most people think.',
    ],
    quiz: [
      {
        q: 'The market just dropped 10%. What does the plan say to do with this payday\'s money?',
        options: ['Skip it until things calm down', 'Invest it as usual'],
        answer: 1,
        why: 'The plan never asks you to guess. A drop just means this paycheck buys more shares.',
      },
      {
        q: 'Fund A charges 0.05% a year. Fund B charges 1%. They hold the same stocks. Which is better?',
        options: ['Fund A', 'Fund B, it must be managed better'],
        answer: 0,
        why: 'Same holdings, same returns before fees. Over 30 years, a 1% fee can eat about a quarter of your money.',
      },
    ],
  },
  {
    id: 'rebalancing',
    title: 'Rebalancing: once a year',
    part: 'The plan',
    minutes: 7,
    short: [
      'Over time some assets grow faster and your mix drifts.',
      'Once a year, or when a slice drifts too far, bring it back to target.',
      'In taxable accounts, steer new money instead of selling.',
    ],
    quiz: [
      {
        q: 'Rebalancing makes you do what, automatically?',
        options: ['Buy what went up', 'Trim what went up and add to what went down'],
        answer: 1,
        why: 'That is "buy low, sell high" without any guessing. The rule decides, not your mood.',
      },
    ],
  },
  {
    id: 'crashes',
    title: 'When markets crash',
    part: 'The plan',
    minutes: 8,
    short: [
      'Crashes are normal. Stocks fall 20% or more every several years.',
      'The plan already expects them. Your bonds, cash, and gold are there for this.',
      'The biggest mistake is selling at the bottom. Keep buying, keep calm.',
    ],
    quiz: [
      {
        q: 'Your portfolio is down 25%. Which action fits the plan?',
        options: ['Sell everything and wait', 'Keep investing on schedule and rebalance if a slice is far off target'],
        answer: 1,
        why: 'Selling locks in the loss. Every major US crash so far has recovered. People who sold often missed the rebound.',
      },
    ],
  },
  {
    id: 'taxes',
    title: 'Taxes: the basics you need',
    part: 'Going deeper',
    minutes: 9,
    short: [
      'Only the dollars above each bracket line get taxed at the higher rate.',
      'Holding an investment more than one year gets a lower tax rate when you sell.',
      'Put tax-heavy assets in tax-advantaged accounts when you can.',
    ],
    quiz: [
      {
        q: 'A raise pushes you into a higher tax bracket. What happens?',
        options: ['All your income is taxed at the new rate', 'Only the dollars above the bracket line are taxed at the higher rate'],
        answer: 1,
        why: 'A raise never lowers your take-home pay because of brackets alone.',
      },
      {
        q: 'You sell a fund at a loss to save on taxes, then buy it back 10 days later. What happens?',
        options: ['You keep the tax break', 'The loss is disallowed under the wash sale rule'],
        answer: 1,
        why: 'Wait more than 30 days, or buy a similar but not identical fund.',
      },
    ],
  },
  {
    id: 'retirement',
    title: 'When the paychecks stop',
    part: 'Going deeper',
    minutes: 14,
    short: [
      'In retirement you sell instead of buy. That changes the risks.',
      'A crash early in retirement is the biggest danger. Cash and bonds protect you from it.',
      'Keep about 2 years of spending in cash. Refill it once a year from whatever is up.',
    ],
    quiz: [
      {
        q: 'Why is a crash in your first year of retirement worse than one 15 years in?',
        options: ['It is not worse', 'You may be forced to sell stocks low to pay bills, and that money never recovers'],
        answer: 1,
        why: 'This is called sequence of returns risk. The bucket system exists to avoid selling stocks in a bad year.',
      },
      {
        q: 'You spend $40,000 a year from savings. About how much do you need using the 4% rule?',
        options: ['$400,000', '$1,000,000', '$160,000'],
        answer: 1,
        why: '$40,000 times 25 is $1,000,000. That is your FI number.',
      },
    ],
  },
  {
    id: 'protect',
    title: 'Protect the plan',
    part: 'Going deeper',
    minutes: 7,
    short: [
      'Insurance protects you from the few events that could wreck everything.',
      'Name a beneficiary on every account. It overrides your will.',
      'A simple will and a list of accounts save your family a lot of pain.',
    ],
    quiz: [
      {
        q: 'Who needs life insurance?',
        options: ['Everyone, the more the better', 'People with others who depend on their income'],
        answer: 1,
        why: 'Life insurance replaces income for people who rely on it. If no one does, you may not need it.',
      },
    ],
  },
  {
    id: 'do-it',
    title: 'Do it: step-by-step',
    part: 'Doing it',
    minutes: 10,
    short: [
      'Reading changes nothing. Setting up the accounts does.',
      'Most of the setup takes one afternoon.',
      'After that, the plan runs on about one hour a year.',
    ],
    quiz: [
      {
        q: 'You moved money into your new Roth IRA. Are you invested?',
        options: ['Yes, automatically', 'Not until you buy funds with that cash'],
        answer: 1,
        why: 'This trips up many beginners. Money in an account can sit as cash for years unless you buy something.',
      },
    ],
  },
  {
    id: 'not-enough',
    title: 'When this site isn\'t enough',
    part: 'Doing it',
    minutes: 5,
    short: [
      'This plan fits most US workers with a regular paycheck.',
      'Some situations need more: self-employment, high incomes, stock pay, pensions, big life events.',
      'If you hire help, look for a fee-only fiduciary.',
    ],
    quiz: [
      {
        q: 'What is a fiduciary?',
        options: ['An advisor legally required to act in your best interest', 'A type of bond'],
        answer: 0,
        why: 'Not all advisors are fiduciaries. Some are paid to sell you products. Ask directly.',
      },
    ],
  },
  {
    id: 'explore',
    title: 'The explore slice (optional)',
    part: 'Doing it',
    minutes: 4,
    short: [
      'Want to pick stocks or trade? Keep it to 10% of your money at most.',
      'The core plan stays untouched, no matter what happens to the slice.',
      'Most people do better without one. That is fine too.',
    ],
    quiz: [
      {
        q: 'Your explore slice doubled. What now?',
        options: ['Move more of the core plan into it', 'Trim it back to 10% and move the extra into the core plan'],
        answer: 1,
        why: 'The cap is the whole point. It keeps a lucky streak from turning into a big risk.',
      },
    ],
  },
]

export const CHAPTERS = META.map((m, i) => ({
  ...m,
  n: i + 1,
  body: bodies[`./chapters/${m.id}.md`] || '',
}))

export const PARTS = [...new Set(CHAPTERS.map((c) => c.part))]

export function chapterById(id) {
  return CHAPTERS.find((c) => c.id === id)
}

// Suggested reading paths from the front door.
export const PATHS = {
  starting: {
    title: 'Starting out',
    blurb: 'New to this, or not investing yet.',
    chapters: ['start-here', 'why-cash-loses-value', 'compounding', 'know-your-numbers', 'safety-first', 'order-of-money', 'asset-jobs', 'your-mix', 'buying', 'crashes', 'do-it'],
  },
  building: {
    title: 'Building',
    blurb: 'Working and saving, retirement is far off.',
    chapters: ['start-here', 'order-of-money', 'asset-jobs', 'your-mix', 'buying', 'rebalancing', 'crashes', 'taxes', 'protect', 'do-it'],
  },
  close: {
    title: 'Close to retirement',
    blurb: 'About 10 years or less to go.',
    chapters: ['start-here', 'asset-jobs', 'your-mix', 'retirement', 'rebalancing', 'crashes', 'taxes', 'protect', 'not-enough'],
  },
  retired: {
    title: 'Retired',
    blurb: 'Living off savings, or helping someone who is.',
    chapters: ['start-here', 'retirement', 'asset-jobs', 'your-mix', 'rebalancing', 'crashes', 'taxes', 'protect', 'not-enough'],
  },
}
