import { Query } from "@/Core/Domain";
import { Either } from "@/Core/Language";

type Data<K extends Query.Kind> = Promise<
  Either.Type<Query.Error<K>, Query.Data<K>>
>;

/**
 * The ApiHelper is responsible for getting data from the API.
 *
 * getData takes in a query and returns async data. The return
 * type is based on the query.kind property. This allows us to
 * define this generic interface, but the return type will be
 * tailored to the specific query passed in.
 */
export interface ApiHelper<Q extends Query.Type = Query.Type> {
  getData(query: Q): Data<typeof query.kind>;
}
