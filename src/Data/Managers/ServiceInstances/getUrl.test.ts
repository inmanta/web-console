import { PageSize, Query } from "@/Core";
import { initialCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getUrl } from "./getUrl";

test("getUrl returns correct url for no filter & no sort", () => {
  const name = "service_a";
  const query: Query.SubQuery<"GetServiceInstances"> = {
    kind: "GetServiceInstances",
    name,
    filter: undefined,
    sort: undefined,
    pageSize: PageSize.initial,
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20`,
  );
});

test("getUrl returns correct url for filter & no sort", () => {
  const name = "service_a";
  const query: Query.SubQuery<"GetServiceInstances"> = {
    kind: "GetServiceInstances",
    name,
    filter: {
      state: ["up", "creating"],
    },
    sort: undefined,
    pageSize: PageSize.from("100"),
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=100&filter.state=up&filter.state=creating`,
  );
});

test("getUrl returns correct url for sort & no filter", () => {
  const name = "service_a";
  const query: Query.SubQuery<"GetServiceInstances"> = {
    kind: "GetServiceInstances",
    name,
    filter: undefined,
    sort: {
      name: "state",
      order: "asc",
    },
    pageSize: PageSize.initial,
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&sort=state.asc`,
  );
});

test("getUrl returns correct url for sort & filter", () => {
  const name = "service_a";
  const query: Query.SubQuery<"GetServiceInstances"> = {
    kind: "GetServiceInstances",
    name,
    filter: {
      state: ["up", "creating"],
    },
    sort: {
      name: "state",
      order: "asc",
    },
    pageSize: PageSize.initial,
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20&filter.state=up&filter.state=creating&sort=state.asc`,
  );
});

test("getUrl returns correct url for empty filter", () => {
  const name = "service_a";
  const query: Query.SubQuery<"GetServiceInstances"> = {
    kind: "GetServiceInstances",
    name,
    filter: {
      state: [],
      id: [],
      attributeSetEmpty: [],
      attributeSetNotEmpty: [],
    },
    pageSize: PageSize.from("50"),
    currentPage: initialCurrentPage,
  };

  expect(getUrl(query)).toMatch(
    `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=50`,
  );
});
