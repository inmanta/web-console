import type { GraphQLCodegenIncremental } from "@apollo/client/incremental";
import type { GraphQLCodegenDataMasking } from "@apollo/client/masking";

/**
 * Tells Apollo's types how codegen types masked fragments and deferred fields, so hook results
 * only expose what a component selects itself and mark deferred fields as possibly missing.
 */
declare module "@apollo/client" {
  /**
   * The events that trigger an automatic refetch. `poll` fires once the network has been quiet
   * for the poll interval, for queries that opt in with `refetchOn: { poll: true }`.
   */
  export interface RefetchEvents {
    poll: number;
  }

  export interface TypeOverrides
    extends GraphQLCodegenDataMasking.TypeOverrides, GraphQLCodegenIncremental.TypeOverrides {}
}
