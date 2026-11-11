// Everything that changes over time lives here.
// Update this file once a year (each January) and the whole site follows.

export const LAST_UPDATED = 'November 2026'
export const LIMITS_YEAR = 2026

// IRS limits for 2026 (IRS Notice 2025-67 and Rev. Proc. 2025-19).
export const LIMITS = {
  k401: 24500, // 401(k), 403(b), most 457 plans, TSP: employee contribution
  k401CatchUp50: 8000, // extra at age 50+
  k401CatchUp60to63: 11250, // extra at ages 60 to 63 (replaces the 50+ amount)
  ira: 7500, // Roth + traditional IRA combined
  iraCatchUp50: 1100,
  hsaSelf: 4400,
  hsaFamily: 8750,
  hsaCatchUp55: 1000,
  rothPhaseOutSingle: [153000, 168000],
  rothPhaseOutJoint: [242000, 252000],
}

// The building blocks. Colors flow through every chart.
export const ASSETS = {
  us: { name: 'US stocks', short: 'US stocks', ticker: 'VTI', alt: 'ITOT, SCHB, FSKAX', color: '#2f6f5e', job: 'Growth' },
  intl: { name: 'International stocks', short: 'Intl stocks', ticker: 'VXUS', alt: 'IXUS, FTIHX', color: '#7fb39a', job: 'Growth' },
  btc: { name: 'Bitcoin', short: 'Bitcoin', ticker: 'IBIT', alt: 'FBTC', color: '#d9822b', job: 'Growth' },
  gold: { name: 'Gold', short: 'Gold', ticker: 'GLDM', alt: 'GLD, IAU', color: '#c9a227', job: 'Hedge' },
  reit: { name: 'Real estate (REITs)', short: 'REITs', ticker: 'REET', alt: 'VNQ (US only)', color: '#8c6bb1', job: 'Hedge' },
  bonds: { name: 'Bonds', short: 'Bonds', ticker: 'BND', alt: 'AGG, FXNAX', color: '#4a72a8', job: 'Protect' },
  cash: { name: 'Cash and T-bills', short: 'Cash', ticker: 'SGOV', alt: 'High-yield savings, money market fund', color: '#9aa5ae', job: 'Protect' },
}

export const ASSET_ORDER = ['us', 'intl', 'btc', 'gold', 'reit', 'bonds', 'cash']

// Expected yearly return AFTER inflation (so every number is in today's dollars).
// Kept on the cautious side on purpose. Nobody knows future returns.
export const REAL_RETURN = { us: 5, intl: 5, btc: 5, gold: 1, reit: 4, bonds: 1.5, cash: 0.5 }

// How far the "low" and "high" lines sit from the middle line, in percentage points per year.
export const RANGE_SPREAD = 2

// The 4 percent rule: you can spend about 4% of your money in year one of retirement.
export const SAFE_WITHDRAWAL = 4

// Three real crashes. Rough, rounded figures for each building block.
// Bitcoin did not exist in 2008, so we assume a typical Bitcoin crash.
export const CRASHES = [
  {
    id: '2008',
    name: '2008 financial crisis',
    window: 'Calendar year 2008',
    returns: { us: -37, intl: -43, btc: -75, gold: 5, reit: -40, bonds: 5, cash: 1 },
    recovery: 'US stocks took about 4 years to get back to their old high, counting dividends.',
    note: 'Bitcoin did not exist yet. We assume a typical Bitcoin crash of about 75%.',
  },
  {
    id: '2020',
    name: '2020 COVID crash',
    window: 'Feb 19 to Mar 23, 2020',
    returns: { us: -34, intl: -33, btc: -40, gold: -3, reit: -42, bonds: -4, cash: 0 },
    recovery: 'US stocks got back to their old high in about 5 months.',
    note: 'The fastest crash on record. It was over in about a month.',
  },
  {
    id: '2022',
    name: '2022 inflation year',
    window: 'Calendar year 2022',
    returns: { us: -20, intl: -16, btc: -64, gold: 0, reit: -25, bonds: -13, cash: 1.5 },
    recovery: 'US stocks got back to their old high in about 2 years.',
    note: 'A rare year when stocks and bonds fell together. Gold held steady.',
  },
]
