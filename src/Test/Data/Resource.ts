import { Resource } from "@/Core";

export const response = {
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
      requires: [
        "std::File[agent2,path=/etc/file3],v=3",
        "std::File[agent1,path=/etc/file2],v=3",
      ],
      status: "unavailable",
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
      status: "orphaned",
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
      status: "orphaned",
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
      status: "available",
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
      status: "deployed",
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
      status: "skipped",
    },
  ],
  links: { self: "/api/v2/resource?limit=20&sort=resource_type.DESC" },
  metadata: {
    total: 12,
    before: 0,
    after: 2,
    page_size: 10,
    deploy_summary: {
      total: 20,
      by_state: {
        deployed: 10,
        skipped: 1,
        skipped_for_undefined: 0,
        cancelled: 1,
        failed: 1,
        unavailable: 2,
        undefined: 2,
        deploying: 2,
        available: 1,
        processing_events: 0,
      },
    },
  },
};

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
      requires: [
        "std::File[agent2,path=/etc/file3],v=3",
        "std::File[agent1,path=/etc/file2],v=3",
      ],
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
    page_size: 20,
  },
};

export const id =
  "kubernetes_calico::resources::IPPool[dc-3,identifier=/cluster/dc-3/calicoctl/kc3-calicoctl/ippool/bb1-ip-pool-3]";

export const encodedId =
  "kubernetes_calico%3A%3Aresources%3A%3AIPPool%5Bdc-3%2Cidentifier%3D%2Fcluster%2Fdc-3%2Fcalicoctl%2Fkc3-calicoctl%2Fippool%2Fbb1-ip-pool-3%5D";
