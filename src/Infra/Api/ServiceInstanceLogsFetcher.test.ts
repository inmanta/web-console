import { Either, Query } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";
import { ServiceInstanceLogsFetcher } from "./ServiceInstanceLogsFetcher";

test("ServiceInstanceLogsFetcher getData fetches logs", async () => {
  const fetcher = new ServiceInstanceLogsFetcher(new BaseApiHelper(undefined));
  const qualifier: Query.Qualifier<"InstanceLogs"> = {
    environment: "env_A",
    service_entity: "service_A",
    id: "instance_A",
  };

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(await fetcher.getData(qualifier)).toEqual(Either.right([]));

  const [url, { headers }] = fetchMock.mock.calls[0];
  expect(url).toEqual("/lsm/v1/service_inventory/service_A/instance_A/log");
  expect(headers).toEqual({ "X-Inmanta-Tid": "env_A" });
});
