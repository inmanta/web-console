import { Either } from "@/Core";

/**
 * The ApiHelper provides basic api helper methods.
 */
export interface ApiHelper {
  getBaseUrl(): string;
  get<T>(url: string, environment: string): Promise<Either.Type<string, T>>;
}
