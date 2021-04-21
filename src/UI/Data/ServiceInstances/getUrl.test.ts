import { Query } from "@/Core";
import { getUrl } from "./getUrl";

test("getUrl returns correct url for no filter & no sort", () => {
  const name = "service_a";
  const qualifier: Query.Qualifier<"ServiceInstances"> = {
    name,
    environment: "env_a",
    filter: undefined,
    sort: undefined,
  };

  expect(getUrl(qualifier)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20`
  );
});

test("getUrl returns correct url for filter & no sort", () => {
  const name = "service_a";
  const qualifier: Query.Qualifier<"ServiceInstances"> = {
    name,
    environment: "env_a",
    filter: {
      state: ["up", "creating"],
    },
    sort: undefined,
  };

  expect(getUrl(qualifier)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&filter.state=up&filter.state=creating`
  );
});

test("getUrl returns correct url for sort & no filter", () => {
  const name = "service_a";
  const qualifier: Query.Qualifier<"ServiceInstances"> = {
    name,
    environment: "env_a",
    filter: undefined,
    sort: {
      name: "state",
      order: "asc",
    },
  };

  expect(getUrl(qualifier)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&sort=state.asc`
  );
});

test("getUrl returns correct url for sort & filter", () => {
  const name = "service_a";
  const qualifier: Query.Qualifier<"ServiceInstances"> = {
    name,
    environment: "env_a",
    filter: {
      state: ["up", "creating"],
    },
    sort: {
      name: "state",
      order: "asc",
    },
  };

  expect(getUrl(qualifier)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&filter.state=up&filter.state=creating&sort=state.asc`
  );
});

test("getUrl returns correct url for empty filter", () => {
  const name = "service_a";
  const qualifier: Query.Qualifier<"ServiceInstances"> = {
    name,
    environment: "env_a",
    filter: {
      state: [],
      id: [],
      attributeSetEmpty: [],
      attributeSetNotEmpty: [],
    },
  };

  expect(getUrl(qualifier)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20`
  );
});
