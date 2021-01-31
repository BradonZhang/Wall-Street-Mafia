export interface Player {
  username: string;
  buyingPower: number;
  totalEquity: number;
}

export interface Stock {
  symbol: string;
  currentPrice: number;
}

export interface Holding {
  symbol: string;
  shares: number;
  avgCost: number;
}
