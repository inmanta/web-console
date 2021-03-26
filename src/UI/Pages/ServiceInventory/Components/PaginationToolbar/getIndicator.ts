import { Pagination } from "@/Core";

export function getIndicator({
  before,
  total,
  page_size,
  after,
}: Pagination.Metadata): string {
  if (total === 0) return "0 of 0";
  if (after === 0) return `${before + 1} - ${total} of ${total}`;
  return `${before + 1} - ${before + page_size} of ${total}`;
}
