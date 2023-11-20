import { a as serviceInstance } from "./ServiceInstance";

export const pageData = {
  first: {
    data: [serviceInstance],
    links: {
      self: "firstpartOfLink?firs-page",
      next: "firstpartOfLink?start=next",
    },
    metadata: {
      total: 100,
      before: 0,
      after: 80,
      page_size: 20,
    },
  },
  second: {
    data: [serviceInstance],
    links: {
      prev: "firstpartOfLink?end=prev",
      self: "firstpartOfLink?second-page",
      next: "firstpartOfLink?start=next",
    },
    metadata: {
      total: 100,
      before: 20,
      after: 60,
      page_size: 20,
    },
  },
};
