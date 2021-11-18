import { a as serviceInstance } from "./ServiceInstance";

export const pageData = {
  first: {
    data: [serviceInstance],
    links: { next: "next", self: "first-page" },
    metadata: {
      total: 100,
      before: 0,
      after: 80,
      page_size: 20,
    },
  },
  second: {
    data: [serviceInstance],
    links: { next: "next", self: "second-page" },
    metadata: {
      total: 100,
      before: 20,
      after: 60,
      page_size: 20,
    },
  },
};
