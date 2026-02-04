import { formatUnits } from "viem";

export function formatBalance(balance: string) {
  return formatUnits(BigInt(balance), 18);
}