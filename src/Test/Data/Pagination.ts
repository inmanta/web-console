import { Pagination } from "@/Core";

export const metadata: Pagination.Metadata = {
  total: 22,
  before: 0,
  after: 2,
  page_size: 20,
};

export const links: Pagination.Links = {
  self: "fake-url",
  next: "next-url?end=fake-param",
};

export const handlers: Pagination.Handlers = {
  prev: "",
  next: "",
};
