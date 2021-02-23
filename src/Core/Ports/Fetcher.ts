import { Either } from "@/Core/Language";
import { Query } from "@/Core/Domain";

/**
 * The Fetcher is responsible for getting data from the API.
 *
 * getData takes in a query and returns async data. The return
 * type is based on the query.kind property. This allows us to
 * define this generic interface, but the return type will be
 * tailored to the specific query passed in.
 */
export interface Fetcher<Kind extends Query.Kind> {
  getData(
    query: Query.SubQuery<Kind>
  ): Promise<Either.Type<Query.Error<Kind>, Query.ApiResponse<Kind>>>;
}
