import { graphql } from "@/Data/Apollo/gql";

/**
 * The environment's resource summary, shared by the Environment Health row and the Resource Manager card.
 * Both use the same document and variables, so Apollo sends a single request for the two.
 */
export const GET_DASHBOARD_RESOURCE_SUMMARY = graphql(`
  query GetDashboardResourceSummary($environment: String!) {
    resourceSummary(environment: $environment) {
      totalCount
      blocked
      compliance
      lastHandlerRun
      isDeploying
    }
  }
`);
