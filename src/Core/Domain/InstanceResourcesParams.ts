export interface InstanceResourcesParams {
  filter?: Filter;
}

export interface Filter {
  state?: string[];
  resource_name?: string[];
}

export enum Kind {
  State = "State",
  Name = "Name",
}
