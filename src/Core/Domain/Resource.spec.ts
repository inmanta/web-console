import {
  ResourceIdDetails,
  resourceIdFromDetails,
  resourceIdToDetails,
} from "./Resource";

test("resourceIdFromDetails", () => {
  const details: ResourceIdDetails = {
    agent: "aws",
    attribute: "hcid",
    resource_id_value: "dxcon-fgpup6qd_4088",
    resource_type: "aws_dc::HostedConnection",
  };
  expect(resourceIdFromDetails(details)).toEqual(
    "aws_dc::HostedConnection[aws,hcid=dxcon-fgpup6qd_4088]"
  );
});

test("resourceIdToDetails 1", () => {
  const details: ResourceIdDetails = {
    agent: "aws",
    attribute: "hcid",
    resource_id_value: "dxcon-fgpup6qd_4088",
    resource_type: "aws_dc::HostedConnection",
  };
  const resourceId = "aws_dc::HostedConnection[aws,hcid=dxcon-fgpup6qd_4088]";
  expect(resourceIdToDetails(resourceId)).toEqual(details);
});

test("resourceIdToDetails 2", () => {
  const details: ResourceIdDetails = {
    agent: "sirius",
    attribute: "service_id",
    resource_id_value: "1000373716",
    resource_type: "sirius::CompleteDisconnectCFSOrderResource",
  };
  const resourceId =
    "sirius::CompleteDisconnectCFSOrderResource[sirius,service_id=1000373716]";
  expect(resourceIdToDetails(resourceId)).toEqual(details);
});
