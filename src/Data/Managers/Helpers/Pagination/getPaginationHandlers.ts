import { Pagination } from '@/Core';

/**
 * Returns pagination handlers for the given links and metadata.
 *
 * @param {Pagination.Links} links - The pagination links.
 * @param {Pagination.Metadata} metadata - The pagination metadata.
 * @returns {Pagination.Handlers} The pagination handlers.
 */
export const getPaginationHandlers = (
  links: Pagination.Links | undefined,
  metadata: Pagination.Metadata,
): Pagination.Handlers => {
  if (!links) {
    return {};
  }

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
  links: Pagination.Links,
  metadata: Pagination.Metadata,
): Urls => {
  const { next, prev } = links;
  const trimmedNext = next?.split(/(?=end=|start=)/g)[1];
  const trimmedPrev = prev?.split(/(?=end=|start=)/g)[1];

  return {
    prev: shouldUseFirst(metadata) ? '' : trimmedPrev,
    next: trimmedNext,
  };
};

const shouldUseFirst = (metadata: Pagination.Metadata): boolean =>
  Number(metadata.before) < Number(metadata.page_size) * 2 &&
  Number(metadata.before) !== 0;
