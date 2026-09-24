/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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
    "\n  fragment PageInfo_Fragment on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    endCursor\n    startCursor\n  }\n": typeof types.PageInfo_FragmentFragmentDoc,
    "\n  query GetDashboardResourceSummary($environment: String!) {\n    resourceSummary(environment: $environment) {\n      totalCount\n      blocked\n      compliance\n      lastHandlerRun\n      isDeploying\n    }\n  }\n": typeof types.GetDashboardResourceSummaryDocument,
    "\n  mutation SetResourceHealth($resourceId: String!, $healthy: Boolean!) {\n    setResourceHealth(resourceId: $resourceId, healthy: $healthy) @client {\n      resourceId\n      state {\n        resourceId\n        lastHandlerRun\n        compliance\n        blocked\n        isDeploying\n      }\n    }\n  }\n": typeof types.SetResourceHealthDocument,
    "\n  fragment ResourceTableRow_Fragment on Resource {\n    resourceId\n    resourceType\n    agent\n    resourceIdValue\n    requiresLength\n    state {\n      resourceId\n      isDeploying\n      lastHandlerRun\n      compliance\n      blocked\n      lastHandlerRunAt\n      isOrphan\n    }\n  }\n": typeof types.ResourceTableRow_FragmentFragmentDoc,
    "\n  query GetResources(\n    $filter: ResourceFilter!\n    $environment: String!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $orderBy: [StrawberryOrder!]\n  ) {\n    ... @defer(label: \"resources\") {\n      resources(\n        filter: $filter\n        first: $first\n        after: $after\n        last: $last\n        before: $before\n        orderBy: $orderBy\n      ) {\n        totalCount\n        pageInfo {\n          ...PageInfo_Fragment @unmask\n        }\n        edges {\n          node {\n            resourceId\n            ...ResourceTableRow_Fragment\n          }\n        }\n      }\n    }\n\n    resourceSummary(environment: $environment) {\n      totalCount\n      isDeploying\n      blocked\n      compliance\n      lastHandlerRun\n    }\n  }\n": typeof types.GetResourcesDocument,
};
const documents: Documents = {
    "\n  fragment PageInfo_Fragment on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    endCursor\n    startCursor\n  }\n": types.PageInfo_FragmentFragmentDoc,
    "\n  query GetDashboardResourceSummary($environment: String!) {\n    resourceSummary(environment: $environment) {\n      totalCount\n      blocked\n      compliance\n      lastHandlerRun\n      isDeploying\n    }\n  }\n": types.GetDashboardResourceSummaryDocument,
    "\n  mutation SetResourceHealth($resourceId: String!, $healthy: Boolean!) {\n    setResourceHealth(resourceId: $resourceId, healthy: $healthy) @client {\n      resourceId\n      state {\n        resourceId\n        lastHandlerRun\n        compliance\n        blocked\n        isDeploying\n      }\n    }\n  }\n": types.SetResourceHealthDocument,
    "\n  fragment ResourceTableRow_Fragment on Resource {\n    resourceId\n    resourceType\n    agent\n    resourceIdValue\n    requiresLength\n    state {\n      resourceId\n      isDeploying\n      lastHandlerRun\n      compliance\n      blocked\n      lastHandlerRunAt\n      isOrphan\n    }\n  }\n": types.ResourceTableRow_FragmentFragmentDoc,
    "\n  query GetResources(\n    $filter: ResourceFilter!\n    $environment: String!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $orderBy: [StrawberryOrder!]\n  ) {\n    ... @defer(label: \"resources\") {\n      resources(\n        filter: $filter\n        first: $first\n        after: $after\n        last: $last\n        before: $before\n        orderBy: $orderBy\n      ) {\n        totalCount\n        pageInfo {\n          ...PageInfo_Fragment @unmask\n        }\n        edges {\n          node {\n            resourceId\n            ...ResourceTableRow_Fragment\n          }\n        }\n      }\n    }\n\n    resourceSummary(environment: $environment) {\n      totalCount\n      isDeploying\n      blocked\n      compliance\n      lastHandlerRun\n    }\n  }\n": types.GetResourcesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PageInfo_Fragment on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    endCursor\n    startCursor\n  }\n"): (typeof documents)["\n  fragment PageInfo_Fragment on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    endCursor\n    startCursor\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetDashboardResourceSummary($environment: String!) {\n    resourceSummary(environment: $environment) {\n      totalCount\n      blocked\n      compliance\n      lastHandlerRun\n      isDeploying\n    }\n  }\n"): (typeof documents)["\n  query GetDashboardResourceSummary($environment: String!) {\n    resourceSummary(environment: $environment) {\n      totalCount\n      blocked\n      compliance\n      lastHandlerRun\n      isDeploying\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetResourceHealth($resourceId: String!, $healthy: Boolean!) {\n    setResourceHealth(resourceId: $resourceId, healthy: $healthy) @client {\n      resourceId\n      state {\n        resourceId\n        lastHandlerRun\n        compliance\n        blocked\n        isDeploying\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetResourceHealth($resourceId: String!, $healthy: Boolean!) {\n    setResourceHealth(resourceId: $resourceId, healthy: $healthy) @client {\n      resourceId\n      state {\n        resourceId\n        lastHandlerRun\n        compliance\n        blocked\n        isDeploying\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ResourceTableRow_Fragment on Resource {\n    resourceId\n    resourceType\n    agent\n    resourceIdValue\n    requiresLength\n    state {\n      resourceId\n      isDeploying\n      lastHandlerRun\n      compliance\n      blocked\n      lastHandlerRunAt\n      isOrphan\n    }\n  }\n"): (typeof documents)["\n  fragment ResourceTableRow_Fragment on Resource {\n    resourceId\n    resourceType\n    agent\n    resourceIdValue\n    requiresLength\n    state {\n      resourceId\n      isDeploying\n      lastHandlerRun\n      compliance\n      blocked\n      lastHandlerRunAt\n      isOrphan\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetResources(\n    $filter: ResourceFilter!\n    $environment: String!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $orderBy: [StrawberryOrder!]\n  ) {\n    ... @defer(label: \"resources\") {\n      resources(\n        filter: $filter\n        first: $first\n        after: $after\n        last: $last\n        before: $before\n        orderBy: $orderBy\n      ) {\n        totalCount\n        pageInfo {\n          ...PageInfo_Fragment @unmask\n        }\n        edges {\n          node {\n            resourceId\n            ...ResourceTableRow_Fragment\n          }\n        }\n      }\n    }\n\n    resourceSummary(environment: $environment) {\n      totalCount\n      isDeploying\n      blocked\n      compliance\n      lastHandlerRun\n    }\n  }\n"): (typeof documents)["\n  query GetResources(\n    $filter: ResourceFilter!\n    $environment: String!\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $orderBy: [StrawberryOrder!]\n  ) {\n    ... @defer(label: \"resources\") {\n      resources(\n        filter: $filter\n        first: $first\n        after: $after\n        last: $last\n        before: $before\n        orderBy: $orderBy\n      ) {\n        totalCount\n        pageInfo {\n          ...PageInfo_Fragment @unmask\n        }\n        edges {\n          node {\n            resourceId\n            ...ResourceTableRow_Fragment\n          }\n        }\n      }\n    }\n\n    resourceSummary(environment: $environment) {\n      totalCount\n      isDeploying\n      blocked\n      compliance\n      lastHandlerRun\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;