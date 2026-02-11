export type LastEvent = {
  block: number;
  timestamp: string;
  eventName: "Incremented" | "NumberSet";
}