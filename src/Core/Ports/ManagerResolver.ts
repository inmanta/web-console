export interface ManagerResolver<Manager> {
  get(): Manager[];
  resolve(env: string): void;
}

export interface ManagerResolverGetter<Manager> {
  getManagerResolver(): ManagerResolver<Manager>;
}
