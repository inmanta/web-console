import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ServiceInstance } from "@/Test";

const data = [
  { ...ServiceInstance.a, id: "a" },
  { ...ServiceInstance.b, id: "b" },
  { ...ServiceInstance.c, id: "c" },
  { ...ServiceInstance.d, id: "d" },
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
  data: data.slice(3),
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

export const paginationServer = setupServer(
  http.get("/lsm/v1/service_inventory/service_name_a", ({ request }) => {
    const url = new URL(request.url);
    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");

    if (startParam === "fake-param") {
      return HttpResponse.json(firstPage);
    }

    if (endParam === "fake-param") {
      return HttpResponse.json(secondPage);
    }

    //default page
    return HttpResponse.json({
      data,
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
    });
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

    if (idParam === ServiceInstance.c.id) {
      return HttpResponse.json({ ...firstPage, data: [ServiceInstance.c] });
    }

    const deletedParam = url.searchParams.get("filter.deleted");

    if (deletedParam === "true") {
      return HttpResponse.json({
        ...firstPage,
        data: [{ ...ServiceInstance.d, state: "terminated", deleted: true }],
      });
    }

    return HttpResponse.json(firstPage);
  }),
);
