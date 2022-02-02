export interface Parameter {
  id: string;
  name: string;
  value: string;
  environment: string;
  source: string;
  updated?: string;
  metadata?: Record<string, string>;
}
