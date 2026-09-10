import { Pagination } from "@/Core";

export interface CursorHandlers {
  prev?: string;
  next?: string;
}

/**
 * The query parameters that make up a `get_resource_actions` pagination cursor.
 * Only these are kept from a link; everything else (`limit` and the echoed
 * filters such as `agent`, `resource_type`, `attribute_value`) is dropped so it
 * is not duplicated with the filters re-applied by `getUrl`.
 */
const CURSOR_KEYS = ["first_timestamp", "last_timestamp", "action_id"];

/**
 * Extracts the cursor fragment from a `get_resource_actions` pagination link.
 *
 * The API echoes the active filters into its `next`/`prev` links, so we keep
 * only the timestamp cursor parameters and re-apply the filters on top of the
 * filtered URL built by `getUrl`. Keeping the echoed filters here would send
 * them twice (e.g. `agent=...&agent=...`), which the API rejects.
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
    .filter((param) => CURSOR_KEYS.some((key) => param.startsWith(`${key}=`)));

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
