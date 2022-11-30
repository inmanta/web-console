export interface ManagerResolver<Type> {
  get(): Type[];
}
