import { Pagination } from "@/Core";

export interface CursorHandlers {
  prev?: string;
  next?: string;
}

/**
 * Extracts the cursor fragment (everything except `limit`) from a
 * `get_resource_actions` pagination link.
 *
 * The API only echoes `limit` and the timestamp cursor in its `next`/`prev`
 * links (not the active filters), so we keep only the cursor part and re-apply
 * it on top of the filtered URL built by `getUrl`.
 *
 * @param {string | undefined} link - A pagination link from the API response.
 * @returns {string | undefined} The cursor fragment (e.g.
 *   `last_timestamp=...&action_id=...`), or undefined when absent.
 */
const toCursorFragment = (link: string | undefined): string | undefined => {
  if (!link) {
    return undefined;
  }

  const query = link.split("?")[1];

  if (!query) {
    return undefined;
  }

  const cursor = query
    .split("&")
    .filter((param) => param.length > 0 && !param.startsWith("limit="));

  return cursor.length > 0 ? cursor.join("&") : undefined;
};

/**
 * Builds the cursor-based pagination handlers for the resource actions table.
 *
 * @param {Pagination.Links | undefined} links - The API pagination links.
 * @returns {CursorHandlers} The prev/next cursor fragments.
 */
export const getCursorHandlers = (links: Pagination.Links | undefined): CursorHandlers => {
  if (!links) {
    return {};
  }

  return {
    prev: toCursorFragment(links.prev),
    next: toCursorFragment(links.next),
  };
};
