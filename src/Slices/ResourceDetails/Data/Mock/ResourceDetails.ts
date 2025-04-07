import { id } from "@/Test/Data/Resource";

export const a = {
  resource_id: id,
  resource_type: "std::File",
  agent: "internal",
  id_attribute: "path",
  id_attribute_value: "/tmp/file4",
  last_deploy: "2021-07-07T09:03:00.000000",
  first_generated_time: "2021-07-07T10:00:00.000000",
  first_generated_version: 2,
  attributes: {
    key1: "modified_value",
    path: "/tmp/file4",
    requires: [
      "std::Directory[internal,path=/tmp/dir1],v=4",
      "std::File[internal,path=/tmp/dir1/file2],v=4",
    ],
    another_key: "val",
  },
  status: "deployed",
  requires_status: {
    "std::Directory[internal,path=/tmp/dir1]": "deployed",
    "std::File[internal,path=/tmp/dir1/file2]": "deploying",
  },
};

export const response = {
  data: a,
};
