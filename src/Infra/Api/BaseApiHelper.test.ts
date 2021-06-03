import { Either } from "@/Core";
import { none } from "@/Core/Language/Maybe";
import { BaseApiHelper } from "./BaseApiHelper";

test("BaseApiHelper.get executes a GET request with correct url & env", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(await apiHelper.get(url, env)).toEqual(Either.right({ data: [] }));

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(url);
  expect(requestInit?.headers).toEqual({ "X-Inmanta-Tid": env });
});

test("BaseApiHelper.post executes a POST request with correct url & env", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(await apiHelper.post(url, env, {})).toEqual(
    Either.right({ data: [] })
  );

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(url);
  expect(requestInit?.headers).toEqual({
    "Content-Type": "application/json",
    "X-Inmanta-Tid": env,
  });
});

test("BaseApiHelper.delete executes a DELETE request with correct url & env", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse("");
  expect(await apiHelper.delete(url, env)).toEqual(none());

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(url);
  expect(requestInit?.headers).toEqual({
    "Content-Type": "application/json",
    "X-Inmanta-Tid": env,
  });
});
