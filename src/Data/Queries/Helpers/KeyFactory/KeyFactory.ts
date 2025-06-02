type KeyArray = (string | number | boolean)[];

export class KeyFactory {
  constructor(
    private readonly sliceKey: string,
    private readonly queryKey?: string
  ) {
    this.queryKey = queryKey;
    this.sliceKey = sliceKey;
  }

  public root(): string[] {
    const keyArray = [this.sliceKey];
    if (this.queryKey) {
      keyArray.push(this.queryKey);
    }
    return keyArray;
  }

  public slice(): string[] {
    return [this.sliceKey];
  }

  public list(params?: KeyArray): KeyArray {
    return [...this.root(), "list", ...(params || [])];
  }

  public single(id: string, params?: KeyArray): KeyArray {
    return [...this.root(), "single", id, ...(params || [])];
  }
}

export enum keySlices {
  agents = "agents",
  auth = "auth",
  callback = "callback",
  compilation = "compilation",
  dashboard = "dashboard",
  desiredState = "desired_state",
  discoveredResource = "discovered_resource",
  dryRun = "dry_run",
  environment = "environment",
  facts = "facts",
  notification = "notification",
  order = "order",
  parameters = "parameters",
  project = "project",
  resource = "resource",
  server = "server",
  service = "service",
  serviceInstance = "service_instance",
}
