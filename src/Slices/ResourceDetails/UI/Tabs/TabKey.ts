/**
 * The tabs of the resource details page, stored in the URL under the `tab` key.
 * Kept in its own module so links into a tab can import it without the tab components.
 */
export enum TabKey {
  Requires = "Requires",
  Attributes = "Attributes",
  History = "History",
  Logs = "Logs",
  Facts = "Facts",
}
