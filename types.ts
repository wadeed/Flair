export enum ServiceStatusEnum {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED = 'DEGRADED',
  OUTAGE = 'OUTAGE',
  UNKNOWN = 'UNKNOWN',
}

export interface StatusHistoryItem {
  timestamp: string;
  status: ServiceStatusEnum;
  description: string;
}

export interface SubServiceStatus {
  name: string;
  status: ServiceStatusEnum;
}

export interface ServiceStatus {
  name: string;
  status: ServiceStatusEnum;
  summary: string;
  details?: string;
  statusPageUrl?: string;
  history?: StatusHistoryItem[];
  subServices?: SubServiceStatus[];
}