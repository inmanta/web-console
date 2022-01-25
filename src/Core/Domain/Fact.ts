export interface Fact {
  id: string;
  name: string;
  value: string;
  environment: string;
  resource_id: string;
  source: string;
  updated?: string;
  metadata?: Record<string, string>;
}
