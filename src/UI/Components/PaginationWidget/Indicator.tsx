import React from "react";
import { Pagination } from "@/Core";

interface Props {
  metadata: Pagination.Metadata;
}

export const Indicator: React.FC<Props> = ({ metadata }) => (
  <span>
    <b>{getCurrent(metadata)}</b> of <b>{metadata.total}</b>
  </span>
);

export function getCurrent({
  before,
  total,
  page_size,
  after,
}: Pagination.Metadata): string {
  if (total === 0) return "0";
  if (after === 0) return `${before + 1} - ${total}`;
  return `${before + 1} - ${before + page_size}`;
}
