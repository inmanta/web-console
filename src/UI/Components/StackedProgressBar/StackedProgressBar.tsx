import { words } from "@/UI";
import { Tooltip } from "@patternfly/react-core";
import React from "react";

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
}) => {
  const scaleToTotal = (bar: number) => (bar / Math.max(total, 1)) * 100;
  const scaledSuccess = scaleToTotal(success);
  const scaledFailure = scaleToTotal(failed);
  const scaledWaiting = scaleToTotal(waiting);
  return (
    <>
      <span className="progress-stacked">
        {total !== 0 && (
          <>
            <Tooltip
              entryDelay={200}
              content={words("inventory.deploymentProgress.waiting")}
            >
              <span style={{ width: `${scaledWaiting}%` }}> {waiting}</span>
            </Tooltip>
            <Tooltip
              entryDelay={200}
              content={words("inventory.deploymentProgress.failed")}
            >
              <span
                style={{ width: `${scaledFailure}%` }}
                className="progress-failure"
              >
                {failed}
              </span>
            </Tooltip>
            <Tooltip
              entryDelay={200}
              content={words("inventory.deploymentProgress.success")}
            >
              <span
                style={{ width: `${scaledSuccess}%` }}
                className="progress-success"
              >
                {success}
              </span>
            </Tooltip>
          </>
        )}
        {total === 0 && (
          <span className="progress-empty">
            {words("inventory.deploymentProgress.notFound")}
          </span>
        )}
      </span>
    </>
  );
};
