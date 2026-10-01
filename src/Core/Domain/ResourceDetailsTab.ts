/**
 * The tabs of the resource details page, stored in the URL under the `tab` key of the
 * `ResourceDetails` route. Links elsewhere use it to open the page on a specific tab.
 */
export enum ResourceDetailsTab {
  Requires = "Requires",
  Attributes = "Attributes",
  History = "History",
  Logs = "Logs",
  Facts = "Facts",
}
