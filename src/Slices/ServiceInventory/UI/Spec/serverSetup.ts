import { ServiceInstance } from "@/Test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const data = [
  ServiceInstance.a,
  ServiceInstance.b,
  ServiceInstance.c,
  ServiceInstance.d,
];
const firstPage = {
  data: data.slice(0, 2),
  links: {
    self: "self",
    next: "fake-link?end=fake-param",
    last: "last",
  },
  metadata: {
    total: 67,
    before: 0,
    after: 47,
    page_size: 20,
  },
};

const secondPage = {
  data: data.slice(2),
  links: {
    first: "first",
    prev: "/lsm/v1/service_inventory/service_name_a?start=fake-param",
    self: "self",
    next: "fake-link?end=fake-param",
    last: "last",
  },
  metadata: {
    total: 67,
    before: 22,
    after: 25,
    page_size: 20,
  },
};

export const defaultServer = setupServer(
  http.get("/lsm/v1/service_inventory/service_name_a", () => {
    return HttpResponse.json(firstPage);
  }),
);

export const paginationServer = setupServer(
  http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
    const url = new URL(request.url);
    const endParam = url.searchParams.get("end");

    if (endParam === "fake-param") {
      return HttpResponse.json(firstPage);
    }

    return HttpResponse.json(secondPage);
  }),
);

export const filterServer = setupServer(
  http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
    const url = new URL(request.url);
    const stateParam = url.searchParams.get("filter.state");

    if (stateParam === "creating") {
      return HttpResponse.json({ ...firstPage, data: [ServiceInstance.a] });
    }
    const idParam = url.searchParams.get("filter.id_or_service_identity");
    console.log(request.url);
    if (idParam === ServiceInstance.c.id) {
      return HttpResponse.json({ ...firstPage, data: [ServiceInstance.c] });
    }

    return HttpResponse.json(firstPage);
  }),
);
