import { Either, Maybe } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";
import { NativeJsonParser } from ".";

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

test("BaseApiHelper.get handles a failed a GET request", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse(JSON.stringify({ message: "Something happened" }), {
    status: 400,
  });
  const response = await apiHelper.get(url, env);
  expect(response).toEqual(
    Either.left(
      `The following error occured while communicating with the server: 400 Bad Request \nSomething happened`
    )
  );
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
  expect(await apiHelper.delete(url, env)).toEqual(Maybe.none());

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(url);
  expect(requestInit?.headers).toEqual({
    "Content-Type": "application/json",
    "X-Inmanta-Tid": env,
  });
});

test("GIVEN BaseApiHelper with BigIntJsonParser WHEN response json contains large integers THEN integers are converted to bigints", async () => {
  const apiHelper = new BaseApiHelper();
  fetchMock.mockResponse(`{"foo": 9223372036854775807}`);
  const response = await apiHelper.get<{ foo: number }>("", "");
  if (response.kind === "Left") return;
  expect(response.value.foo).toEqual(9223372036854775807n);
});

test("GIVEN BaseApiHelper with NativeJsonParser WHEN response json contains large integers THEN parsing loses precision", async () => {
  const apiHelper = new BaseApiHelper(new NativeJsonParser());
  fetchMock.mockResponse(`{"foo": 9223372036854775807}`);
  const response = await apiHelper.get<{ foo: number }>("", "");
  if (response.kind === "Left") return;
  expect(response.value.foo).not.toEqual(9223372036854775807n);
});

test("GIVEN BaseApiHelper with getWithHTTPCode WHEN request fails with 409 THEN response has code 409", async () => {
  const apiHelper = new BaseApiHelper(new NativeJsonParser());
  fetchMock.mockResponse(`{"foo": 9223372036854775807}`, { status: 409 });
  const response = await apiHelper.getWithHTTPCode<{ foo: number }>("", "");
  if (response.kind === "Right") return;
  expect(response.value.status).toEqual(409);
});
