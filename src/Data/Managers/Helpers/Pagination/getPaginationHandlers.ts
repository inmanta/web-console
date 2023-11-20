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
  prev?: string[];
  next?: string[];
}

const getPaginationHandlerUrls = (
  { prev, next }: Pagination.Links,
  metadata: Pagination.Metadata,
): Urls => {
  const trimmedNext = next?.split(/(?=start=)/g)[1];
  const trimmedPrev = prev?.split(/(?=end=)/g)[1];
  const separatedNextParameters = trimmedNext?.split("&");
  const separatedPrevParameters = trimmedPrev?.split("&");

  return {
    prev: shouldUseFirst(metadata) ? [] : separatedPrevParameters,
    next: separatedNextParameters,
  };
};

const shouldUseFirst = (metadata: Pagination.Metadata): boolean =>
  Number(metadata.before) < Number(metadata.page_size) * 2 &&
  Number(metadata.before) !== 0;
