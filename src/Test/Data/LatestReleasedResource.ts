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
      requires: [],
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
  metadata: { total: 6, before: 0, after: 0, page_size: 20 },
};
