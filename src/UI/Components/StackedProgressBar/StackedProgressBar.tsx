import React from "react";
import styled from "styled-components";
import { Tooltip } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  total: number;
  success: number;
  failed: number;
  waiting: number;
}

export const StackedProgressBar: React.FC<Props> = ({
  total,
  success,
  failed,
  waiting,
}) => (
  <Container>
    {total !== 0 && (
      <>
        <Tooltip
          entryDelay={200}
          content={words("inventory.deploymentProgress.ready")}
        >
          <Success percentage={getPercentage(total, success)}>
            {success}
          </Success>
        </Tooltip>
        <Tooltip
          entryDelay={200}
          content={words("inventory.deploymentProgress.failed")}
        >
          <Failure percentage={getPercentage(total, failed)}>{failed}</Failure>
        </Tooltip>
        <Tooltip
          entryDelay={200}
          content={words("inventory.deploymentProgress.inProgress")}
        >
          <Waiting percentage={getPercentage(total, waiting)}>
            {waiting}
          </Waiting>
        </Tooltip>
      </>
    )}
    {total === 0 && (
      <Empty>{words("inventory.deploymentProgress.notFound")}</Empty>
    )}
  </Container>
);

const getPercentage = (total: number, value: number) =>
  (value / Math.max(total, 1)) * 100;

const Container = styled.span`
  background-color: var(--pf-global--BackgroundColor--100);
  color: var(--pf-global--palette--black-100);
  box-sizing: initial;
  font-size: var(--pf-global--FontSize--sm);
  height: var(--pf-c-progress__indicator--Height);
  line-height: var(--pf-c-progress__indicator--Height);
  margin: 6px 0;
  position: relative;
  text-align: center;
  width: 100%;
`;

const Base = styled.span`
  background-color: var(--pf-global--primary-color--100);
  color: var(--pf-global--palette--black-100);
  display: inline-block;
  overflow: hidden;
  position: relative;
  width: auto;
  vertical-align: top;
`;

const BaseWithPercentage = styled(Base)<{ percentage: number }>`
  width: ${(p) => p.percentage}%;
`;

const Waiting = BaseWithPercentage;

const Success = styled(BaseWithPercentage)`
  background-color: var(--pf-global--success-color--100);
`;

const Failure = styled(BaseWithPercentage)`
  background-color: var(--pf-global--danger-color--100);
`;

const Empty = styled(Base)`
  background-color: var(--pf-global--palette--blue-50);
  color: var(--pf-global--palette--black-900);
  width: 100%;
`;
