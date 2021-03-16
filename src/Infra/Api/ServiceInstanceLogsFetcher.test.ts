import { Either, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";
import { ServiceInstanceLogsFetcher } from "./ServiceInstanceLogsFetcher";
import { InstanceLog } from "@/Test";

test("ServiceInstanceLogsFetcher getData fetches logs (empty)", async () => {
  const fetcher = new ServiceInstanceLogsFetcher(new BaseApiHelper(undefined));
  const qualifier: Query.Qualifier<"InstanceLogs"> = {
    id: "service_instance_id_a",
    environment: "environment_a",
    service_entity: "service_name_a",
  };

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(await fetcher.getData(qualifier)).toEqual(Either.right({ data: [] }));

  const [url, { headers }] = fetchMock.mock.calls[0];
  expect(url).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
  );
  expect(headers).toEqual({ "X-Inmanta-Tid": "environment_a" });
});

test("ServiceInstanceLogsFetcher getData fetches logs (1)", async () => {
  const fetcher = new ServiceInstanceLogsFetcher(new BaseApiHelper(undefined));
  const qualifier: Query.Qualifier<"InstanceLogs"> = {
    id: "service_instance_id_a",
    environment: "environment_a",
    service_entity: "service_name_a",
  };

  fetchMock.mockResponse(JSON.stringify({ data: [InstanceLog.A] }));
  expect(await fetcher.getData(qualifier)).toEqual(
    Either.right({ data: [InstanceLog.A] })
  );

  const [url, { headers }] = fetchMock.mock.calls[0];
  expect(url).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
  );
  expect(headers).toEqual({ "X-Inmanta-Tid": "environment_a" });
});
