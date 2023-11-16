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

  const separatedNextParametes = trimmedNext?.split("&");
  const separatedPrevParametes = trimmedPrev?.split("&");
  return {
    prev: shouldUseFirst(metadata) ? [] : separatedPrevParametes,
    next: separatedNextParametes,
  };
};

const shouldUseFirst = (metadata: Pagination.Metadata): boolean =>
  Number(metadata.before) < Number(metadata.page_size) * 2;
