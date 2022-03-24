import { DeferredApiHelper } from "./DeferredApiHelper";

test("GIVEN DeferredApiHelper WHEN ignore THEN removes first pending request", async () => {
  const helper = new DeferredApiHelper();
  helper.get("url1", "env1");
  helper.get("url2", "env2");
  expect(helper.pendingRequests).toHaveLength(2);
  helper.ignore();
  expect(helper.pendingRequests).toEqual([
    { method: "GET", url: "url2", environment: "env2" },
  ]);
});

test("GIVEN DeferredApiHelper WHEN ignoreRequest THEN removes first matching request", async () => {
  const helper = new DeferredApiHelper();
  helper.get("url1", "env1");
  helper.get("url2", "env2");
  helper.post("url3", "env3", { test: 123 });
  expect(helper.pendingRequests).toHaveLength(3);
  helper.ignoreRequest({ method: "GET", url: "url2", environment: "env2" });
  expect(helper.pendingRequests).toHaveLength(2);
  expect(helper.pendingRequests).toEqual([
    { method: "GET", url: "url1", environment: "env1" },
    { method: "POST", url: "url3", environment: "env3", body: { test: 123 } },
  ]);
  helper.ignoreRequest({
    method: "POST",
    url: "url3",
    environment: "env3",
    body: { test: 123 },
  });
  expect(helper.pendingRequests).toHaveLength(1);
  expect(helper.pendingRequests).toEqual([
    { method: "GET", url: "url1", environment: "env1" },
  ]);
});

test("GIVEN DeferredApiHelper WHEN resolve THEN resolves first pending request", async () => {
  const helper = new DeferredApiHelper();
  helper.get("url1", "env1");
  helper.get("url2", "env2");
  expect(helper.pendingRequests).toHaveLength(2);
  await helper.resolve({ test: 123 });
  expect(helper.pendingRequests).toHaveLength(1);
  expect(helper.pendingRequests).toEqual([
    { method: "GET", url: "url2", environment: "env2" },
  ]);
  expect(helper.resolvedRequests).toHaveLength(1);
  expect(helper.resolvedRequests).toEqual([
    { method: "GET", url: "url1", environment: "env1", data: { test: 123 } },
  ]);
});

test("GIVEN DeferredApiHelper WHEN resolveRequest THEN resolves first matching request", async () => {
  const helper = new DeferredApiHelper();
  helper.get("url1", "env1");
  helper.get("url2", "env2");
  helper.post("url3", "env3", { test: "abc" });
  expect(helper.pendingRequests).toHaveLength(3);

  await helper.resolveRequest(
    { method: "GET", url: "url2", environment: "env2" },
    { test: 123 }
  );
  expect(helper.pendingRequests).toHaveLength(2);
  expect(helper.pendingRequests).toEqual([
    { method: "GET", url: "url1", environment: "env1" },
    { method: "POST", url: "url3", environment: "env3", body: { test: "abc" } },
  ]);
  expect(helper.resolvedRequests).toHaveLength(1);
  expect(helper.resolvedRequests).toEqual([
    { method: "GET", url: "url2", environment: "env2", data: { test: 123 } },
  ]);
  await helper.resolveRequest(
    { method: "POST", url: "url3", environment: "env3", body: { test: "abc" } },
    { test: "def" }
  );
  expect(helper.pendingRequests).toHaveLength(1);
  expect(helper.resolvedRequests[1]).toEqual({
    method: "POST",
    url: "url3",
    environment: "env3",
    body: { test: "abc" },
    data: { test: "def" },
  });
});

test("GIVEN DeferredApiHelper WHEN resolveRequest THEN resolves first matching request", async () => {
  const helper = new DeferredApiHelper();
  expect(() =>
    helper.resolveRequest(
      { method: "GET", url: "url2", environment: "env2" },
      { test: 123 }
    )
  ).toThrow();
  helper.get("url1", "env1");
  expect(() =>
    helper.resolveRequest(
      { method: "GET", url: "url2", environment: "env2" },
      { test: 123 }
    )
  ).toThrow();
});
