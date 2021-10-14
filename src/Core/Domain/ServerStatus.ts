interface Extension {
  name: string;
  version: string;
  package: string;
}

interface Slice {
  name: string;
  status: Record<string, unknown>;
}

interface Feature {
  slice: string;
  name: string;
  value: unknown;
}

export interface ServerStatus {
  product: string;
  edition: string;
  version: string;
  license: string;
  extensions: Extension[];
  slices: Slice[];
  features: Feature[];
}
