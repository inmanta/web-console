import { Either } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";
import { FetcherImpl } from "./FetcherImpl";
import { InstanceLog } from "@/Test";

test("FetcherImpl getData fetches logs (empty)", async () => {
  const fetcher = new FetcherImpl<"GetInstanceLogs">(new BaseApiHelper());

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(
    await fetcher.getData(
      "environment_a",
      "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
    )
  ).toEqual(Either.right({ data: [] }));

  const [url, requestInit] = fetchMock.mock.calls[0];
  expect(url).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
  );
  expect(requestInit?.headers).toEqual({ "X-Inmanta-Tid": "environment_a" });
});

test("FetcherImpl getData fetches logs (1)", async () => {
  const fetcher = new FetcherImpl<"GetInstanceLogs">(new BaseApiHelper());

  fetchMock.mockResponse(JSON.stringify({ data: [InstanceLog.a] }));
  expect(
    await fetcher.getData(
      "environment_a",
      "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
    )
  ).toEqual(Either.right({ data: [InstanceLog.a] }));

  const [url, requestInit] = fetchMock.mock.calls[0];
  expect(url).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
  );
  expect(requestInit?.headers).toEqual({ "X-Inmanta-Tid": "environment_a" });
});
