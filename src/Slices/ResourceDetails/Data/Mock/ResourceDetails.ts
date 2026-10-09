import { Details, Status } from "@/Core/Domain/Resource/Resource";
import { referenceAttributes } from "@/Data/Common/References/Mock";
import { id } from "@/Test/Data/Resource";

export const a: Details = {
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
    hash: "abc123",
  },
  status: Status.deployed,
  requires_status: {
    "std::Directory[internal,path=/tmp/dir1]": Status.deployed,
    "std::File[internal,path=/tmp/dir1/file2]": Status.deploying,
  },
};

export const response = {
  data: a,
};

/**
 * A resource whose desired state exercises the reference feature: a whole
 * attribute replaced by a reference (`value`), a reference nested inside a value
 * (`api.'api_token'`), a plain attribute (`url`), a framework attribute
 * (`send_event`), and the machinery keys that the structured view hides but the
 * JSON view keeps.
 */
export const withReferences: Details = { ...a, attributes: referenceAttributes };
