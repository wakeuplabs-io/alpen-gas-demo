import { env } from "@/config/env";
import { Authorization, Call } from "@/types/delegate";


/**
 * Sets up EIP-7702 delegation by submitting a type-4 transaction
 * This activates delegation: the EOA's code becomes 0xef0100<implementation-address>
 * @param user - The user's address
 * @param authorization - The authorization object
 * @returns The result of the delegation setup
 * @returns 
 */
export async function delegateSetup(user: string, authorization: Authorization) {
  const  response = await fetch(`${env.apiUrl}/api/delegate/setup`, {
    method: "POST",
    body: JSON.stringify({ user, authorization }),
  });

  if (!response.ok) {
    throw new Error("Failed to delegate");
  }

  const result = await response.json();

  return result;
}

export async function delegateTransact(user: string, calls: Call[], signature: string) {

  const response = await fetch(`${env.apiUrl}/api/delegate/transact`, {
    method: "POST",
    body: JSON.stringify({ user, calls, signature }),
  });

  if (!response.ok) {
    throw new Error("Failed to transact");
  }

  const result = await response.json();

  return result;
} 
