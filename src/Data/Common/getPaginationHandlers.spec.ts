import { Pagination } from "@/Core";
import { getPaginationHandlers } from "./getPaginationHandlers";

test("GIVEN getPaginationHandlers WHEN on 1st page THEN no prev", () => {
  const links: Pagination.Links = {
    self: "self",
    next: "next",
    last: "last",
  };
  const metadata: Pagination.Metadata = {
    total: 55,
    before: 0,
    after: 35,
    page_size: 20,
  };

  const setUrl = jest.fn();
  const { prev, next } = getPaginationHandlers(links, metadata, setUrl);

  next && next();
  expect(prev).toBeUndefined();
  expect(setUrl.mock.calls[0][0]).toEqual("next");
});

test("GIVEN getPaginationHandler WHEN on 2nd page THEN prev is first", () => {
  const links: Pagination.Links = {
    first: "first",
    prev: "prev",
    self: "self",
    next: "next",
    last: "last",
  };
  const metadata: Pagination.Metadata = {
    total: 55,
    before: 20,
    after: 15,
    page_size: 20,
  };

  const setUrl = jest.fn();
  const { prev, next } = getPaginationHandlers(links, metadata, setUrl);

  prev && prev();
  next && next();
  expect(setUrl.mock.calls[0][0]).toEqual("first");
  expect(setUrl.mock.calls[1][0]).toEqual("next");
});

test("GIVEN getPaginationHandlerUrls WHEN on 2nd page (with outdated 1st page) THEN prev is first", () => {
  const links: Pagination.Links = {
    first: "first",
    prev: "prev",
    self: "self",
    next: "next",
    last: "last",
  };
  const metadata: Pagination.Metadata = {
    total: 57,
    before: 22,
    after: 15,
    page_size: 20,
  };

  const setUrl = jest.fn();
  const { prev, next } = getPaginationHandlers(links, metadata, setUrl);

  prev && prev();
  next && next();
  expect(setUrl.mock.calls[0][0]).toEqual("first");
  expect(setUrl.mock.calls[1][0]).toEqual("next");
});

test("GIVEN getPaginationHandlerUrls WHEN on 3rd page THEN prev is prev", () => {
  const links: Pagination.Links = {
    self: "self",
    first: "first",
    prev: "prev",
  };
  const metadata: Pagination.Metadata = {
    total: 55,
    before: 40,
    after: 0,
    page_size: 20,
  };

  const setUrl = jest.fn();
  const { prev, next } = getPaginationHandlers(links, metadata, setUrl);

  prev && prev();
  expect(next).toBeUndefined();
  expect(setUrl.mock.calls[0][0]).toEqual("prev");
});
