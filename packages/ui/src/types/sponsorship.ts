export enum SponsorshipStatus {
  UNCHECKED = 'unchecked',
  CHECKING = 'checking',
  ELIGIBLE = 'eligible',
  DAILY_LIMIT = 'daily-limit',
  POLICY_DENY = 'policy-deny',
  SERVICE_DOWN = 'service-down',
}

export interface SponsorshipState {
  status: SponsorshipStatus;
  dailyRemaining: number;
  dailyLimit: number;
  globalDailyLimit: number;
}
