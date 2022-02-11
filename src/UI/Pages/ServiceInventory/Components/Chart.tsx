import React from "react";
import styled from "styled-components";
import { InstanceSummary } from "@/Core";
import { SummaryChart } from "@/UI/Components";

interface Props {
  summary?: InstanceSummary | null;
}

export const Chart: React.FC<Props> = ({ summary }) =>
  summary ? (
    <ChartContainer>
      <SummaryChart
        by_label={summary.by_label}
        total={summary.total.toString()}
      />
    </ChartContainer>
  ) : null;

const ChartContainer = styled.div`
  height: 230px;
  width: 350px;
`;
