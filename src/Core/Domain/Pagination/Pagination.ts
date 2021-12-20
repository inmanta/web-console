export interface Handlers {
  prev?: () => void;
  next?: () => void;
}

export interface Links {
  first?: string;
  prev?: string;
  self: string;
  next?: string;
  last?: string;
}

export interface Metadata {
  total: number;
  before: number;
  after: number;
  page_size: number;
}
