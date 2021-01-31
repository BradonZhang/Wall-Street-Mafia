export interface Player {
  id: number;
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

export type HoldingMap = {[symbol: string]: Holding};

export interface ViewProps {
  prices: Array<Stock>;
  holdings: HoldingMap;
  player: Player | null;
}
