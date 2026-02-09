export interface Authorization {
  address: string;
  nonce: number;
  chainId: number;
  r: string;
  s: string;
  v: string;
  yParity: number;
}

export interface Call {
  to: string;
  value: string;
  data: string;
}