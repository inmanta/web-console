import React from "react";
import styled from "styled-components";
import { Pagination } from "@/Core";

interface Props {
  metadata: Pagination.Metadata;
}

export const Indicator: React.FC<Props> = ({ metadata }) => (
  <Container>
    <b>{getCurrent(metadata)}</b> of <b>{metadata.total as React.ReactNode}</b>
  </Container>
);

const Container = styled.span`
  display: inline-block;
  text-align: right;
  min-width: 120px;
`;

export function getCurrent({
  before,
  total,
  page_size,
  after,
}: Pagination.Metadata): string {
  if (total === 0) return "0";
  if (after === 0) return `${Number(before) + 1} - ${total}`;
  return `${Number(before) + 1} - ${Number(before) + Number(page_size)}`;
}
