import { Either } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";
import { FetcherImpl } from "./FetcherImpl";
import { InstanceLog } from "@/Test";

test("FetcherImpl getData fetches logs (empty)", async () => {
  const fetcher = new FetcherImpl<"InstanceLogs">(new BaseApiHelper());

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(
    await fetcher.getData(
      "environment_a",
      "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
    )
  ).toEqual(Either.right({ data: [] }));

  const [url, { headers }] = fetchMock.mock.calls[0];
  expect(url).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
  );
  expect(headers).toEqual({ "X-Inmanta-Tid": "environment_a" });
});

test("FetcherImpl getData fetches logs (1)", async () => {
  const fetcher = new FetcherImpl<"InstanceLogs">(new BaseApiHelper());

  fetchMock.mockResponse(JSON.stringify({ data: [InstanceLog.A] }));
  expect(
    await fetcher.getData(
      "environment_a",
      "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
    )
  ).toEqual(Either.right({ data: [InstanceLog.A] }));

  const [url, { headers }] = fetchMock.mock.calls[0];
  expect(url).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/log"
  );
  expect(headers).toEqual({ "X-Inmanta-Tid": "environment_a" });
});
