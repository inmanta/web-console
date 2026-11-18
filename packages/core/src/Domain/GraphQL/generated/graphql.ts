/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Blocked =
  | 'BLOCKED'
  | 'NOT_BLOCKED'
  | 'TEMPORARILY_BLOCKED';

export type BlockedEnumFilter = {
  eq?: Array<Blocked> | null | undefined;
  neq?: Array<Blocked> | null | undefined;
};

export type Compliance =
  | 'COMPLIANT'
  | 'HAS_UPDATE'
  | 'NON_COMPLIANT'
  | 'UNDEFINED';

export type ComplianceEnumFilter = {
  eq?: Array<Compliance> | null | undefined;
  neq?: Array<Compliance> | null | undefined;
};

export type HandlerResult =
  | 'FAILED'
  | 'NEW'
  | 'SKIPPED'
  | 'SUCCESSFUL';

export type HandlerResultEnumFilter = {
  eq?: Array<HandlerResult> | null | undefined;
  neq?: Array<HandlerResult> | null | undefined;
};

export type NotificationFilter = {
  cleared?: boolean | null | undefined;
  environment: string;
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

export type GetEnvironmentPreviewQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEnvironmentPreviewQuery = { environments: { edges: Array<{ node: { name: string, id: string, halted: boolean, isExpertMode: boolean, isCompiling: boolean } }> } };

export type GetPartialNotificationsQueryVariables = Exact<{
  filter: NotificationFilter;
  orderBy?: Array<StrawberryOrder> | StrawberryOrder | null | undefined;
}>;


export type GetPartialNotificationsQuery = { notifications: { edges: Array<{ node: { title: string, severity: string | null, read: boolean } }> } };

export type GetModelVersionForInstanceVersionQueryVariables = Exact<{
  filter: ResourceFilter;
}>;


export type GetModelVersionForInstanceVersionQuery = { resources: { edges: Array<{ node: { modelVersion: number } }> } };

export type GetResourcesQueryVariables = Exact<{
  filter: ResourceFilter;
  environment: string;
  first?: number | null | undefined;
  after?: string | null | undefined;
  last?: number | null | undefined;
  before?: string | null | undefined;
  orderBy?: Array<StrawberryOrder> | StrawberryOrder | null | undefined;
}>;


export type GetResourcesQuery = { resources: { totalCount: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, endCursor: string | null, startCursor: string | null }, edges: Array<{ node: { resourceId: string, resourceType: string, agent: string, resourceIdValue: string, requiresLength: number, state: { isDeploying: boolean | null, lastHandlerRun: string, compliance: Compliance | null, blocked: string, lastHandlerRunAt: string | null, isOrphan: boolean } | null } }> }, resourceSummary: { lastHandlerRun: unknown, blocked: unknown, compliance: unknown, isDeploying: unknown, totalCount: number } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetEnvironmentPreviewDocument = new TypedDocumentString(`
    query GetEnvironmentPreview {
  environments {
    edges {
      node {
        name
        id
        halted
        isExpertMode
        isCompiling
      }
    }
  }
}
    `) as unknown as TypedDocumentString<GetEnvironmentPreviewQuery, GetEnvironmentPreviewQueryVariables>;
export const GetPartialNotificationsDocument = new TypedDocumentString(`
    query GetPartialNotifications($filter: NotificationFilter!, $orderBy: [StrawberryOrder!]) {
  notifications(filter: $filter, orderBy: $orderBy) {
    edges {
      node {
        title
        severity
        read
      }
    }
  }
}
    `) as unknown as TypedDocumentString<GetPartialNotificationsQuery, GetPartialNotificationsQueryVariables>;
export const GetModelVersionForInstanceVersionDocument = new TypedDocumentString(`
    query GetModelVersionForInstanceVersion($filter: ResourceFilter!) {
  resources(filter: $filter, first: 1) {
    edges {
      node {
        modelVersion
      }
    }
  }
}
    `) as unknown as TypedDocumentString<GetModelVersionForInstanceVersionQuery, GetModelVersionForInstanceVersionQueryVariables>;
export const GetResourcesDocument = new TypedDocumentString(`
    query GetResources($filter: ResourceFilter!, $environment: String!, $first: Int, $after: String, $last: Int, $before: String, $orderBy: [StrawberryOrder!]) {
  resources(
    filter: $filter
    first: $first
    after: $after
    last: $last
    before: $before
    orderBy: $orderBy
  ) {
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
    edges {
      node {
        resourceId
        resourceType
        agent
        resourceIdValue
        requiresLength
        state {
          isDeploying
          lastHandlerRun
          compliance
          blocked
          lastHandlerRunAt
          isOrphan
        }
      }
    }
  }
  resourceSummary(environment: $environment) {
    lastHandlerRun
    blocked
    compliance
    isDeploying
    totalCount
  }
}
    `) as unknown as TypedDocumentString<GetResourcesQuery, GetResourcesQueryVariables>;