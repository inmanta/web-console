import { Pagination } from "@/Core";

export const getPaginationHandlers = (
  links: Pagination.Links,
  metadata: Pagination.Metadata,
  setUrl: (url: string) => void,
): Pagination.Handlers => {
  const { prev, next } = getPaginationHandlerUrls(links, metadata);

  return {
    prev: prev ? () => setUrl(prev) : undefined,
    next: next ? () => setUrl(next) : undefined,
  };
};

interface Urls {
  prev?: string;
  next?: string;
}

const getPaginationHandlerUrls = (
  { prev, next, first }: Pagination.Links,
  metadata: Pagination.Metadata,
): Urls => ({
  prev: shouldUseFirst(metadata) ? first : prev,
  next,
});

const shouldUseFirst = (metadata: Pagination.Metadata): boolean =>
  Number(metadata.before) < Number(metadata.page_size) * 2;
