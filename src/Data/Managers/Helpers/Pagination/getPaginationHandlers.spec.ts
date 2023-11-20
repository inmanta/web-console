import { Pagination } from "@/Core";
import { getPaginationHandlers } from "./getPaginationHandlers";

test("GIVEN getPaginationHandlers WHEN on 1st page THEN no prev", () => {
  const links: Pagination.Links = {
    self: "firstpartOfLink?self",
    next: "firstpartOfLink?start=next",
    last: "firstpartOfLink?last",
  };
  const metadata: Pagination.Metadata = {
    total: 55,
    before: 0,
    after: 35,
    page_size: 20,
  };

  const { prev, next } = getPaginationHandlers(links, metadata);

  expect(prev).toBeUndefined();
  expect(next).toEqual(["start=next"]);
});

test("GIVEN getPaginationHandler WHEN on 2nd page THEN prev is first", () => {
  const links: Pagination.Links = {
    first: "firstpartOfLink?first",
    prev: "firstpartOfLink?end=prev",
    self: "firstpartOfLink?self",
    next: "firstpartOfLink?start=next",
    last: "firstpartOfLink?last",
  };
  const metadata: Pagination.Metadata = {
    total: 55,
    before: 20,
    after: 15,
    page_size: 20,
  };

  const { prev, next } = getPaginationHandlers(links, metadata);

  expect(prev).toEqual([]);
  expect(next).toEqual(["start=next"]);
});

test("GIVEN getPaginationHandlerUrls WHEN on 2nd page (with outdated 1st page) THEN prev is first", () => {
  const links: Pagination.Links = {
    first: "firstpartOfLink?first",
    prev: "firstpartOfLink?end=prev",
    self: "firstpartOfLink?self",
    next: "firstpartOfLink?start=next",
    last: "firstpartOfLink?last",
  };
  const metadata: Pagination.Metadata = {
    total: 57,
    before: 22,
    after: 15,
    page_size: 20,
  };

  const { prev, next } = getPaginationHandlers(links, metadata);

  expect(prev).toEqual([]);
  expect(next).toEqual(["start=next"]);
});

test("GIVEN getPaginationHandlerUrls WHEN on 3rd page THEN prev is prev", () => {
  const links: Pagination.Links = {
    self: "firstpartOfLink?self",
    first: "firstpartOfLink?first",
    prev: "firstpartOfLink?end=prev",
  };
  const metadata: Pagination.Metadata = {
    total: 55,
    before: 40,
    after: 0,
    page_size: 20,
  };

  const { prev, next } = getPaginationHandlers(links, metadata);

  expect(next).toBeUndefined();
  expect(prev).toEqual(["end=prev"]);
});
