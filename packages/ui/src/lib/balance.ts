import { formatUnits } from "ethers";

export function formatBalance(balance: string) {
  return formatUnits(BigInt(balance), 18);
}