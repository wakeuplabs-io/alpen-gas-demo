import { Contract } from "ethers";
import { PROVIDER } from "@/lib/network";
import { COUNTER_ABI, COUNTER_ADDRESS } from "./contracts";
import { LastEvent } from "@/types/event";

async function getContractDeploymentBlock(contractAddress: string): Promise<number> {
  const currentBlock = await PROVIDER.getBlockNumber();
  
  const currentCode = await PROVIDER.getCode(contractAddress, currentBlock);
  if (!currentCode || currentCode === "0x") {
    throw new Error("Contract does not exist at current block");
  }
  
  let left = 0;
  let right = currentBlock;
  let deploymentBlock = currentBlock;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const code = await PROVIDER.getCode(contractAddress, mid);
    
    if (code && code !== "0x") {
      deploymentBlock = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  return deploymentBlock;
}

export class CounterEventService {
  private counterContract: Contract;

  constructor() {
    if (!COUNTER_ADDRESS) {
      throw new Error("COUNTER_ADDRESS is not defined");
    }
    this.counterContract = new Contract(COUNTER_ADDRESS, COUNTER_ABI, PROVIDER);
  }

  async getLastEvent(): Promise<LastEvent | undefined> {
    if (!COUNTER_ADDRESS) {
      return undefined;
    }

    const currentBlock = await PROVIDER.getBlockNumber();
    const deploymentBlock = await getContractDeploymentBlock(COUNTER_ADDRESS);
    const MAX_BLOCK_RANGE = 99000;
    
    const allIncrementedEvents: Awaited<ReturnType<typeof this.counterContract.queryFilter>> = [];
    const allNumberSetEvents: Awaited<ReturnType<typeof this.counterContract.queryFilter>> = [];
    
    let fromBlock = Math.max(deploymentBlock, currentBlock - MAX_BLOCK_RANGE);
    let toBlock = currentBlock;
    
    while (toBlock >= deploymentBlock) {
      try {
        const [incrementedEvents, numberSetEvents] = await Promise.all([
          this.counterContract.queryFilter(
            this.counterContract.filters.Incremented(),
            fromBlock,
            toBlock
          ),
          this.counterContract.queryFilter(
            this.counterContract.filters.NumberSet(),
            fromBlock,
            toBlock
          ),
        ]);
        
        allIncrementedEvents.push(...incrementedEvents);
        allNumberSetEvents.push(...numberSetEvents);
        
        if (incrementedEvents.length > 0 || numberSetEvents.length > 0) {
          break;
        }
        
        toBlock = fromBlock - 1;
        fromBlock = Math.max(deploymentBlock, toBlock - MAX_BLOCK_RANGE);
        
        if (toBlock < deploymentBlock) {
          break;
        }
      } catch (chunkError) {
        console.warn("Error querying chunk, trying smaller range:", chunkError);
        if (toBlock - fromBlock <= 1000) {
          break;
        }
        const chunkSize = Math.floor((toBlock - fromBlock) / 2);
        toBlock = fromBlock + chunkSize;
        fromBlock = Math.max(deploymentBlock, toBlock - chunkSize);
      }
    }

    type EventWithName = {
      event: typeof allIncrementedEvents[0] | typeof allNumberSetEvents[0];
      eventName: "Incremented" | "NumberSet";
    };

    const allEvents: EventWithName[] = [
      ...allIncrementedEvents.map((e) => ({ event: e, eventName: "Incremented" as const })),
      ...allNumberSetEvents.map((e) => ({ event: e, eventName: "NumberSet" as const })),
    ].sort((a: EventWithName, b: EventWithName) => {
      if (a.event.blockNumber !== b.event.blockNumber) {
        return Number(b.event.blockNumber) - Number(a.event.blockNumber);
      }
      if (a.event.transactionIndex !== b.event.transactionIndex) {
        return Number(b.event.transactionIndex) - Number(a.event.transactionIndex);
      }
      return Number(b.event.index) - Number(a.event.index);
    });

    if (allEvents.length > 0) {
      const latestEventWithName = allEvents[0];
      const latestEvent = latestEventWithName.event;
      const block = await PROVIDER.getBlock(latestEvent.blockNumber);
      
      return {
        block: Number(latestEvent.blockNumber),
        timestamp: new Date((block?.timestamp || 0) * 1000).toISOString(),
        eventName: latestEventWithName.eventName,
      };
    }

    return undefined;
  }
}
