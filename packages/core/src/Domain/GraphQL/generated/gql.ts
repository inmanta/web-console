/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetEnvironmentPreview {\n    environments {\n      edges {\n        node {\n          name\n          id\n          halted\n          isExpertMode\n          isCompiling\n        }\n      }\n    }\n  }\n": typeof types.GetEnvironmentPreviewDocument,
    "\n  query GetPartialNotifications($filter: NotificationFilter!, $orderBy: [StrawberryOrder!]) {\n    notifications(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          title\n          severity\n          read\n        }\n      }\n    }\n  }\n": typeof types.GetPartialNotificationsDocument,
    "\n  query GetModelVersionForInstanceVersion($filter: ResourceFilter!) {\n    resources(filter: $filter, first: 1) {\n      edges {\n        node {\n          modelVersion\n        }\n      }\n    }\n  }\n": typeof types.GetModelVersionForInstanceVersionDocument,
    "\n  query GetResources(\n    $filter: ResourceFilter!\n    $environment: String!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $orderBy: [StrawberryOrder!]\n  ) {\n    resources(\n      filter: $filter\n      first: $first\n      after: $after\n      last: $last\n      before: $before\n      orderBy: $orderBy\n    ) {\n      totalCount\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        endCursor\n        startCursor\n      }\n      edges {\n        node {\n          resourceId\n          resourceType\n          agent\n          resourceIdValue\n          requiresLength\n          state {\n            isDeploying\n            lastHandlerRun\n            compliance\n            blocked\n            lastHandlerRunAt\n            isOrphan\n          }\n        }\n      }\n    }\n    resourceSummary(environment: $environment) {\n      lastHandlerRun\n      blocked\n      compliance\n      isDeploying\n      totalCount\n    }\n  }\n": typeof types.GetResourcesDocument,
};
const documents: Documents = {
    "\n  query GetEnvironmentPreview {\n    environments {\n      edges {\n        node {\n          name\n          id\n          halted\n          isExpertMode\n          isCompiling\n        }\n      }\n    }\n  }\n": types.GetEnvironmentPreviewDocument,
    "\n  query GetPartialNotifications($filter: NotificationFilter!, $orderBy: [StrawberryOrder!]) {\n    notifications(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          title\n          severity\n          read\n        }\n      }\n    }\n  }\n": types.GetPartialNotificationsDocument,
    "\n  query GetModelVersionForInstanceVersion($filter: ResourceFilter!) {\n    resources(filter: $filter, first: 1) {\n      edges {\n        node {\n          modelVersion\n        }\n      }\n    }\n  }\n": types.GetModelVersionForInstanceVersionDocument,
    "\n  query GetResources(\n    $filter: ResourceFilter!\n    $environment: String!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $orderBy: [StrawberryOrder!]\n  ) {\n    resources(\n      filter: $filter\n      first: $first\n      after: $after\n      last: $last\n      before: $before\n      orderBy: $orderBy\n    ) {\n      totalCount\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        endCursor\n        startCursor\n      }\n      edges {\n        node {\n          resourceId\n          resourceType\n          agent\n          resourceIdValue\n          requiresLength\n          state {\n            isDeploying\n            lastHandlerRun\n            compliance\n            blocked\n            lastHandlerRunAt\n            isOrphan\n          }\n        }\n      }\n    }\n    resourceSummary(environment: $environment) {\n      lastHandlerRun\n      blocked\n      compliance\n      isDeploying\n      totalCount\n    }\n  }\n": types.GetResourcesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetEnvironmentPreview {\n    environments {\n      edges {\n        node {\n          name\n          id\n          halted\n          isExpertMode\n          isCompiling\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').GetEnvironmentPreviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPartialNotifications($filter: NotificationFilter!, $orderBy: [StrawberryOrder!]) {\n    notifications(filter: $filter, orderBy: $orderBy) {\n      edges {\n        node {\n          title\n          severity\n          read\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').GetPartialNotificationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetModelVersionForInstanceVersion($filter: ResourceFilter!) {\n    resources(filter: $filter, first: 1) {\n      edges {\n        node {\n          modelVersion\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').GetModelVersionForInstanceVersionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetResources(\n    $filter: ResourceFilter!\n    $environment: String!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $orderBy: [StrawberryOrder!]\n  ) {\n    resources(\n      filter: $filter\n      first: $first\n      after: $after\n      last: $last\n      before: $before\n      orderBy: $orderBy\n    ) {\n      totalCount\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        endCursor\n        startCursor\n      }\n      edges {\n        node {\n          resourceId\n          resourceType\n          agent\n          resourceIdValue\n          requiresLength\n          state {\n            isDeploying\n            lastHandlerRun\n            compliance\n            blocked\n            lastHandlerRunAt\n            isOrphan\n          }\n        }\n      }\n    }\n    resourceSummary(environment: $environment) {\n      lastHandlerRun\n      blocked\n      compliance\n      isDeploying\n      totalCount\n    }\n  }\n"): typeof import('./graphql').GetResourcesDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
