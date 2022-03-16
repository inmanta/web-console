import { Pagination } from "@/Core";

export const metadata: Pagination.Metadata = {
  total: 12,
  before: 0,
  after: 2,
  page_size: 10,
};

export const links: Pagination.Links = {
  self: "fake-url",
};

export const handlers: Pagination.Handlers = {
  prev: () => undefined,
  next: () => undefined,
};
