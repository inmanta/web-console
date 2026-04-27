import { Resource } from "@/Core";

export const responseFromVersion: Resource.ResponseFromVersion = {
  data: [
    {
      resource_id: "std::File[agent2,path=/tmp/file4]",
      resource_version_id: "std::File[agent2,path=/tmp/file4],v=3",
      id_details: {
        resource_type: "std::File",
        agent: "agent2",
        attribute: "path",
        resource_id_value: "/tmp/file4",
      },
      requires: ["std::File[agent2,path=/etc/file3],v=3", "std::File[agent1,path=/etc/file2],v=3"],
    },
    {
      resource_id: "std::File[agent2,path=/etc/file3]",
      resource_version_id: "std::File[agent2,path=/etc/file3],v=2",
      id_details: {
        resource_type: "std::File",
        agent: "agent2",
        attribute: "path",
        resource_id_value: "/etc/file3",
      },
      requires: [],
    },
    {
      resource_id: "std::File[agent1,path=/etc/file2]",
      resource_version_id: "std::File[agent1,path=/etc/file2],v=2",
      id_details: {
        resource_type: "std::File",
        agent: "agent1",
        attribute: "path",
        resource_id_value: "/etc/file2",
      },
      requires: [],
    },
    {
      resource_id: "std::File[agent1,path=/etc/file1]",
      resource_version_id: "std::File[agent1,path=/etc/file1],v=3",
      id_details: {
        resource_type: "std::File",
        agent: "agent1",
        attribute: "path",
        resource_id_value: "/etc/file1",
      },
      requires: [],
    },
    {
      resource_id: "std::Directory[agent3,path=/tmp/dir6]",
      resource_version_id: "std::Directory[agent3,path=/tmp/dir6],v=3",
      id_details: {
        resource_type: "std::Directory",
        agent: "agent3",
        attribute: "path",
        resource_id_value: "/tmp/dir6",
      },
      requires: [],
    },
    {
      resource_id: "std::Directory[agent2,path=/tmp/dir5]",
      resource_version_id: "std::Directory[agent2,path=/tmp/dir5],v=3",
      id_details: {
        resource_type: "std::Directory",
        agent: "agent2",
        attribute: "path",
        resource_id_value: "/tmp/dir5",
      },
      requires: [],
    },
  ],
  links: { self: "/api/v2/resource?limit=20&sort=resource_type.DESC" },
  metadata: {
    total: 6,
    before: 0,
    after: 0,
    page_size: 100,
  },
};

export const id =
  "kubernetes_calico::resources::IPPool[dc-3,identifier=/cluster/dc-3/calicoctl/kc3-calicoctl/ippool/bb1-ip-pool-3]";

export const encodedId =
  "kubernetes_calico%3A%3Aresources%3A%3AIPPool%5Bdc-3%2Cidentifier%3D%2Fcluster%2Fdc-3%2Fcalicoctl%2Fkc3-calicoctl%2Fippool%2Fbb1-ip-pool-3%5D";

type Overrides = Partial<Resource.ResourceSummary>;

export const createMockResourceSummary = (overrides?: Overrides): Resource.ResourceSummary => {
  return {
    blocked: {
      not_blocked: 4,
      blocked: 1,
      temporarily_blocked: 1,
    },
    compliance: {
      compliant: 3,
      has_update: 1,
      non_compliant: 1,
      undefined: 1,
    },
    lastHandlerRun: {
      successful: 2,
      new: 2,
      failed: 1,
      skipped: 1,
    },
    isDeploying: {
      true: 1,
      false: 5,
    },
    totalCount: 106,

    ...overrides,
  };
};

export const response = {
  data: {
    resources: {
      totalCount: 106,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: "",
        startCursor: "",
      },
      edges: [
        {
          node: {
            resourceId: "std::File[agent2,path=/tmp/file4]",
            resourceType: "std::File",
            agent: "agent2",
            resourceIdValue: "/tmp/file4",
            requiresLength: 2,
            state: {
              isDeploying: false,
              lastHandlerRun: "FAILED",
              compliance: "NON_COMPLIANT",
              blocked: "NOT_BLOCKED",
              lastHandlerRunAt: "2026-04-17T06:35:06.679396+00:00",
              isOrphan: false,
            },
          },
        },
        {
          node: {
            resourceId: "std::File[agent2,path=/etc/file3]",
            resourceType: "std::File",
            agent: "agent2",
            resourceIdValue: "/etc/file3",
            requiresLength: 0,
            state: {
              isDeploying: false,
              lastHandlerRun: "SKIPPED",
              compliance: "NON_COMPLIANT",
              blocked: "NOT_BLOCKED",
              lastHandlerRunAt: "2026-04-17T06:35:06.681797+00:00",
              isOrphan: true,
            },
          },
        },
        {
          node: {
            resourceId: "std::File[agent1,path=/etc/file2]",
            resourceType: "std::File",
            agent: "agent1",
            resourceIdValue: "/etc/file2",
            requiresLength: 0,
            state: {
              isDeploying: true,
              lastHandlerRun: "FAILED",
              compliance: "NON_COMPLIANT",
              blocked: "NOT_BLOCKED",
              lastHandlerRunAt: "2026-04-17T06:34:49.579473+00:00",
              isOrphan: false,
            },
          },
        },
        {
          node: {
            resourceId: "std::File[agent1,path=/etc/file1]",
            resourceType: "std::File",
            agent: "agent1",
            resourceIdValue: "/etc/file1",
            requiresLength: 0,
            state: {
              isDeploying: false,
              lastHandlerRun: "SUCCESSFUL",
              compliance: "COMPLIANT",
              blocked: "NOT_BLOCKED",
              lastHandlerRunAt: "2026-04-16T09:06:00.066981+00:00",
              isOrphan: false,
            },
          },
        },
        {
          node: {
            resourceId: "std::Directory[agent3,path=/tmp/dir6]",
            resourceType: "std::Directory",
            agent: "agent3",
            resourceIdValue: "/tmp/dir6",
            requiresLength: 0,
            state: {
              isDeploying: false,
              lastHandlerRun: "SUCCESSFUL",
              compliance: "COMPLIANT",
              blocked: "NOT_BLOCKED",
              lastHandlerRunAt: "2026-04-16T14:25:47.171406+00:00",
              isOrphan: false,
            },
          },
        },
        {
          node: {
            resourceId: "std::Directory[agent2,path=/tmp/dir5]",
            resourceType: "std::Directory",
            agent: "agent2",
            resourceIdValue: "/tmp/dir5",
            requiresLength: 0,
            state: {
              isDeploying: false,
              lastHandlerRun: "SKIPPED",
              compliance: "HAS_UPDATE",
              blocked: "BLOCKED",
              lastHandlerRunAt: "2026-04-16T08:06:00.077542+00:00",
              isOrphan: false,
            },
          },
        },
      ],
    },

    resourceSummary: createMockResourceSummary(),
  },
};
