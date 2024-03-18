import { Either, Maybe } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

const baseUrl = "http://localhost:8888";
const spyDispatch = jest.spyOn(document, "dispatchEvent");

test("BaseApiHelper.get executes a GET request with correct url & env", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(await apiHelper.get(url, env)).toEqual(Either.right({ data: [] }));

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(baseUrl + url);
  expect(requestInit?.headers).toEqual({ "X-Inmanta-Tid": env });
});

test("BaseApiHelper.post executes a POST request with correct url & env", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  expect(await apiHelper.post(url, env, {})).toEqual(
    Either.right({ data: [] }),
  );

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(url);
  expect(requestInit?.headers).toEqual({
    "Content-Type": "application/json",
    "X-Inmanta-Tid": env,
  });
});

test("BaseApiHelper.get handles a failed a GET request", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse(JSON.stringify({ message: "Something happened" }), {
    status: 400,
  });
  const response = await apiHelper.get(url, env);
  //Polyfill required for msw changed 400 response text from 'Bad Request' to empty string
  expect(response).toEqual(
    Either.left(
      `The following error occured while communicating with the server: 400  \nSomething happened`,
    ),
  );
});

test("BaseApiHelper.delete executes a DELETE request with correct url & env", async () => {
  const apiHelper = new BaseApiHelper();
  const url = "/test-url";
  const env = "environment_a";

  fetchMock.mockResponse("");
  expect(await apiHelper.delete(url, env)).toEqual(Maybe.none());

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(baseUrl + url);
  expect(requestInit?.headers).toEqual({
    "Content-Type": "application/json",
    "X-Inmanta-Tid": env,
  });
});

test("GIVEN BaseApiHelper WHEN response json contains large integers THEN integers are converted to bigints", async () => {
  const apiHelper = new BaseApiHelper();
  fetchMock.mockResponse(`{"foo": 9223372036854775807}`);
  const response = await apiHelper.get<{ foo: number }>("", "");
  if (response.kind === "Left") return;
  expect(response.value.foo).toEqual(9223372036854775807n);
});

test("GIVEN BaseApiHelper with getWithHTTPCode WHEN request fails with 409 THEN response has code 409", async () => {
  const apiHelper = new BaseApiHelper();
  fetchMock.mockResponse(`{"foo": 9223372036854775807}`, { status: 409 });
  const response = await apiHelper.getWithHTTPCode<{ foo: number }>("", "");
  if (response.kind === "Right") return;
  expect(response.value.status).toEqual(409);
});

describe("BaseHelper event dispatching", () => {
  test("BaseApiHelper emit event when request return status 401 and localAuth is enabled", async () => {
    const apiHelper = new BaseApiHelper(baseUrl, true);
    const url = "/test-url";
    const env = "environment_a";

    fetchMock.mockResponse(JSON.stringify({ message: "Something happened" }), {
      status: 401,
    });
    await apiHelper.get(url, env);
    expect(spyDispatch).toHaveBeenCalledWith(new CustomEvent("open-login"));
  });
  test("BaseApiHelper emit event when request return status 401 but localAuth is disabled", async () => {
    const apiHelper = new BaseApiHelper(baseUrl, false);
    const url = "/test-url";
    const env = "environment_a";

    fetchMock.mockResponse(JSON.stringify({ message: "Something happened" }), {
      status: 401,
    });
    await apiHelper.get(url, env);
    expect(spyDispatch).not.toHaveBeenCalled();
  });

  test("BaseApiHelper doesn't emit events when request return status 400", async () => {
    const apiHelper = new BaseApiHelper(baseUrl, true);
    const url = "/test-url";
    const env = "environment_a";

    fetchMock.mockResponse(JSON.stringify({ message: "Something happened" }), {
      status: 400,
    });
    await apiHelper.get(url, env);
    expect(spyDispatch).not.toHaveBeenCalled();
  });

  test("BaseApiHelper doesn't emit events when request return status 403", async () => {
    const apiHelper = new BaseApiHelper(baseUrl, true);
    const url = "/test-url";
    const env = "environment_a";

    fetchMock.mockResponse(JSON.stringify({ message: "Something happened" }), {
      status: 403,
    });
    await apiHelper.get(url, env);
    expect(spyDispatch).not.toHaveBeenCalled();
  });

  test("BaseApiHelper doesn't emit events when request return status 404", async () => {
    const apiHelper = new BaseApiHelper(baseUrl, true);
    const url = "/test-url";
    const env = "environment_a";

    fetchMock.mockResponse(JSON.stringify({ message: "Something happened" }), {
      status: 404,
    });
    await apiHelper.get(url, env);
    expect(spyDispatch).not.toHaveBeenCalled();
  });
});
