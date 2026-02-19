import { PROVIDER } from "./network";

/**
 * Gets the account code at a specific block number (or latest if not provided)
 * @param address - The address to check
 * @param blockNumber - Optional block number to query (if not provided, queries latest)
 * @returns The account code or null if not found
 */
export async function getAccountCodeAtBlock(
  address: string,
  blockNumber?: number
): Promise<string | null> {
  const accountCode = await PROVIDER.getCode(address, blockNumber);
  
  if (!accountCode || accountCode === "0x" || accountCode === "0x0" || accountCode.length <= 2) {
    return null;
  }

  return accountCode;
}

/**
 * Gets the account code with retries to handle provider delays
 * @param address - The address to check
 * @param maxAttempts - Maximum number of retry attempts (default: 5)
 * @param pollInterval - Time between retries in milliseconds (default: 500)
 * @returns The account code or null if not found after retries
 */
export async function getAccountCodeWithRetry(
  address: string,
  maxAttempts: number = 5,
  pollInterval: number = 500
): Promise<string | null> {
  let attempts = 0;
  let accountCode = await PROVIDER.getCode(address);

  while ((!accountCode || accountCode === "0x" || accountCode === "0x0" || accountCode.length <= 2) && attempts < maxAttempts) {
    if (attempts > 0) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    accountCode = await PROVIDER.getCode(address);
    attempts++;
  }

  if (!accountCode || accountCode === "0x" || accountCode === "0x0" || accountCode.length <= 2) {
    return null;
  }

  return accountCode;
}

/**
 * Checks if an account is delegated with EIP-7702 format
 * @param accountCode - The account code to check
 * @returns true if the code matches EIP-7702 format (starts with 0xef0100)
 */
export function isDelegated(accountCode: string | null): boolean {
  if (!accountCode) return false;
  const magicBytes = accountCode.slice(0, 10);
  return magicBytes.startsWith('0xef0100');
}

/**
 * Gets the implementation address from a delegated account code
 * @param accountCode - The account code (must be in EIP-7702 format)
 * @returns The implementation address (0x + 20 bytes after 0xef0100)
 */
export function getDelegationImplementation(accountCode: string): string {
  return "0x" + accountCode.slice(10);
}

/**
 * Checks if an account is delegated to a specific implementation
 * @param address - The address to check
 * @param expectedImplementation - The expected implementation address
 * @param blockNumber - Optional block number to query (if not provided, queries latest)
 * @returns true if delegated to the expected implementation, false otherwise
 */
export async function isDelegatedToImplementation(
  address: string,
  expectedImplementation: string,
  blockNumber?: number
): Promise<boolean> {
  const accountCode = await getAccountCodeAtBlock(address, blockNumber);
  if (!accountCode || !isDelegated(accountCode)) {
    return false;
  }

  const currentImplementation = "0x" + accountCode.split("0xef0100")[1];
  if (currentImplementation.toLowerCase() === expectedImplementation.toLowerCase()){
    return true;
  }

  return false;
}
