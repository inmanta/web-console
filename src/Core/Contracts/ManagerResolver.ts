export interface ManagerResolver<Manager> {
  get(): Manager[];
}
