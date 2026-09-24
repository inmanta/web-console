/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export const Blocked = {
  Blocked: 'BLOCKED',
  NotBlocked: 'NOT_BLOCKED',
  TemporarilyBlocked: 'TEMPORARILY_BLOCKED'
} as const;

export type Blocked = typeof Blocked[keyof typeof Blocked];
export type BlockedEnumFilter = {
  eq?: Array<Blocked> | null | undefined;
  neq?: Array<Blocked> | null | undefined;
};

export const Compliance = {
  Compliant: 'COMPLIANT',
  HasUpdate: 'HAS_UPDATE',
  NonCompliant: 'NON_COMPLIANT',
  Undefined: 'UNDEFINED'
} as const;

export type Compliance = typeof Compliance[keyof typeof Compliance];
export type ComplianceEnumFilter = {
  eq?: Array<Compliance> | null | undefined;
  neq?: Array<Compliance> | null | undefined;
};

export const HandlerResult = {
  Failed: 'FAILED',
  New: 'NEW',
  Skipped: 'SKIPPED',
  Successful: 'SUCCESSFUL'
} as const;

export type HandlerResult = typeof HandlerResult[keyof typeof HandlerResult];
export type HandlerResultEnumFilter = {
  eq?: Array<HandlerResult> | null | undefined;
  neq?: Array<HandlerResult> | null | undefined;
};

export type ResourceFilter = {
  agent?: StrFilter | null | undefined;
  blocked?: BlockedEnumFilter | null | undefined;
  compliance?: ComplianceEnumFilter | null | undefined;
  environment: string;
  includeOwned?: boolean | null | undefined;
  instanceVersion?: number | null | undefined;
  isDeploying?: boolean | null | undefined;
  isOrphan?: boolean | null | undefined;
  lastHandlerRun?: HandlerResultEnumFilter | null | undefined;
  lifecycleState?: Array<string> | null | undefined;
  modelVersion?: number | null | undefined;
  purged?: boolean | null | undefined;
  resourceIdValue?: StrFilter | null | undefined;
  resourceType?: StrFilter | null | undefined;
  serviceEntity?: Array<string> | null | undefined;
  serviceInstance?: Array<string> | null | undefined;
};

export type StrFilter = {
  contains?: Array<string> | null | undefined;
  eq?: Array<string> | null | undefined;
  neq?: Array<string> | null | undefined;
  notContains?: Array<string> | null | undefined;
};

export type StrawberryOrder = {
  key: string;
  order?: string;
};

export type PageInfo_FragmentFragment = { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor: string | null, startCursor: string | null } & { ' $fragmentName'?: 'PageInfo_FragmentFragment' };

export type GetDashboardResourceSummaryQueryVariables = Exact<{
  environment: string;
}>;


export type GetDashboardResourceSummaryQuery = { __typename: 'Query', resourceSummary: { __typename: 'ComposedResourceSummary', totalCount: number, blocked: unknown, compliance: unknown, lastHandlerRun: unknown, isDeploying: unknown } };

export type SetResourceHealthMutationVariables = Exact<{
  resourceId: string;
  healthy: boolean;
}>;


export type SetResourceHealthMutation = { __typename: 'Mutation', setResourceHealth: { __typename: 'Resource', resourceId: string, state: { __typename: 'ResourcePersistentState', resourceId: string, lastHandlerRun: string, compliance: Compliance | null, blocked: string, isDeploying: boolean | null } | null } };

export type ResourceTableRow_FragmentFragment = { __typename: 'Resource', resourceId: string, resourceType: string, agent: string, resourceIdValue: string, requiresLength: number, state: { __typename: 'ResourcePersistentState', resourceId: string, isDeploying: boolean | null, lastHandlerRun: string, compliance: Compliance | null, blocked: string, lastHandlerRunAt: string | null, isOrphan: boolean } | null } & { ' $fragmentName'?: 'ResourceTableRow_FragmentFragment' };

export type GetResourcesQueryVariables = Exact<{
  filter: ResourceFilter;
  environment: string;
  first?: number | null | undefined;
  after?: string | null | undefined;
  last?: number | null | undefined;
  before?: string | null | undefined;
  orderBy?: Array<StrawberryOrder> | StrawberryOrder | null | undefined;
}>;


export type GetResourcesQuery = { __typename: 'Query', resourceSummary: { __typename: 'ComposedResourceSummary', totalCount: number, isDeploying: unknown, blocked: unknown, compliance: unknown, lastHandlerRun: unknown } } & ({ __typename: 'Query', resources: { __typename: 'ResourceConnection', totalCount: number | null, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor: string | null, startCursor: string | null }, edges: Array<{ __typename: 'ResourceEdge', node: (
        { __typename: 'Resource', resourceId: string }
        & { ' $fragmentRefs'?: { 'ResourceTableRow_FragmentFragment': ResourceTableRow_FragmentFragment } }
      ) }> } } | { __typename: 'Query', resources?: never });

export const PageInfo_FragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfo_Fragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}}]} as unknown as DocumentNode<PageInfo_FragmentFragment, unknown>;
export const ResourceTableRow_FragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResourceTableRow_Fragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Resource"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceType"}},{"kind":"Field","name":{"kind":"Name","value":"agent"}},{"kind":"Field","name":{"kind":"Name","value":"resourceIdValue"}},{"kind":"Field","name":{"kind":"Name","value":"requiresLength"}},{"kind":"Field","name":{"kind":"Name","value":"state"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeploying"}},{"kind":"Field","name":{"kind":"Name","value":"lastHandlerRun"}},{"kind":"Field","name":{"kind":"Name","value":"compliance"}},{"kind":"Field","name":{"kind":"Name","value":"blocked"}},{"kind":"Field","name":{"kind":"Name","value":"lastHandlerRunAt"}},{"kind":"Field","name":{"kind":"Name","value":"isOrphan"}}]}}]}}]} as unknown as DocumentNode<ResourceTableRow_FragmentFragment, unknown>;
export const GetDashboardResourceSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDashboardResourceSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"environment"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"environment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"environment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"blocked"}},{"kind":"Field","name":{"kind":"Name","value":"compliance"}},{"kind":"Field","name":{"kind":"Name","value":"lastHandlerRun"}},{"kind":"Field","name":{"kind":"Name","value":"isDeploying"}}]}}]}}]} as unknown as DocumentNode<GetDashboardResourceSummaryQuery, GetDashboardResourceSummaryQueryVariables>;
export const SetResourceHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetResourceHealth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"healthy"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setResourceHealth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"resourceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resourceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"healthy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"healthy"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"state"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"lastHandlerRun"}},{"kind":"Field","name":{"kind":"Name","value":"compliance"}},{"kind":"Field","name":{"kind":"Name","value":"blocked"}},{"kind":"Field","name":{"kind":"Name","value":"isDeploying"}}]}}]}}]}}]} as unknown as DocumentNode<SetResourceHealthMutation, SetResourceHealthMutationVariables>;
export const GetResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetResources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResourceFilter"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"environment"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StrawberryOrder"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","directives":[{"kind":"Directive","name":{"kind":"Name","value":"defer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"label"},"value":{"kind":"StringValue","value":"resources","block":false}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}},{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageInfo_Fragment"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"unmask"}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ResourceTableRow_Fragment"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"resourceSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"environment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"environment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"isDeploying"}},{"kind":"Field","name":{"kind":"Name","value":"blocked"}},{"kind":"Field","name":{"kind":"Name","value":"compliance"}},{"kind":"Field","name":{"kind":"Name","value":"lastHandlerRun"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfo_Fragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ResourceTableRow_Fragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Resource"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"resourceType"}},{"kind":"Field","name":{"kind":"Name","value":"agent"}},{"kind":"Field","name":{"kind":"Name","value":"resourceIdValue"}},{"kind":"Field","name":{"kind":"Name","value":"requiresLength"}},{"kind":"Field","name":{"kind":"Name","value":"state"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceId"}},{"kind":"Field","name":{"kind":"Name","value":"isDeploying"}},{"kind":"Field","name":{"kind":"Name","value":"lastHandlerRun"}},{"kind":"Field","name":{"kind":"Name","value":"compliance"}},{"kind":"Field","name":{"kind":"Name","value":"blocked"}},{"kind":"Field","name":{"kind":"Name","value":"lastHandlerRunAt"}},{"kind":"Field","name":{"kind":"Name","value":"isOrphan"}}]}}]}}]} as unknown as DocumentNode<GetResourcesQuery, GetResourcesQueryVariables>;