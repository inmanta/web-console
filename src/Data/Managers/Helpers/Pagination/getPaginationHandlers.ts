import { Pagination } from "@/Core";

export const getPaginationHandlers = (
  links: Pagination.Links,
  metadata: Pagination.Metadata,
): Pagination.Handlers => {
  const { prev, next } = getPaginationHandlerUrls(links, metadata);

  return {
    prev,
    next,
  };
};

interface Urls {
  prev?: string;
  next?: string;
}

const getPaginationHandlerUrls = (
  { prev, next }: Pagination.Links,
  metadata: Pagination.Metadata,
): Urls => {
  const trimmedNext = next?.split(/(?=end=|start=)/g)[1];
  const trimmedPrev = prev?.split(/(?=end=|start=)/g)[1];

  return {
    prev: shouldUseFirst(metadata) ? "" : trimmedPrev,
    next: trimmedNext,
  };
};

const shouldUseFirst = (metadata: Pagination.Metadata): boolean =>
  Number(metadata.before) < Number(metadata.page_size) * 2 &&
  Number(metadata.before) !== 0;
