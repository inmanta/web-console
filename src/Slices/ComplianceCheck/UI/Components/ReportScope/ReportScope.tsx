import React, { useMemo } from "react";
import { Alert, Card, CardBody, CardHeader, CardTitle, Flex } from "@patternfly/react-core";
import { Diff, DryRun } from "@/Core";
import { useGetDesiredStateVersion } from "@/Data/Queries/Slices/DesiredState";
import { DesiredStateStatusLabel } from "@/UI/Components/DesiredStateStatusLabel";
import { words } from "@/UI/words";
import { AppliedFilter } from "./AppliedFilter";
import { countDiff, createReportScopeParts, isKnownInactive } from "./helpers";

interface Props {
  report: DryRun;
  diff: Diff.Resource[] | undefined;
  onRerunStart: () => void;
}

/**
 * One count on the scope line, keyed by what it counts.
 */
interface ScopeCount {
  id: "resources" | "agents" | "changed";
  count: number;
  text: string;
}

/**
 * Shows what a dry run report covered, between the report picker and its diff. The scope line
 * shows the model version with its lifecycle status, and counts the resources (out of all
 * resources in the model version, for a dry run on a filter), agents and changes, so an empty diff
 * never reads as the whole model being compliant. A version that isn't active gets a warning. A dry
 * run started on a resource filter also shows that filter.
 *
 * @props {Props} props - The props of the component
 *  @prop {DryRun} report - The selected dry run report
 *  @prop {Diff.Resource[] | undefined} diff - The resources of the report, undefined while they
 *    load; the agent and change counts show once they are there
 *  @prop {() => void} onRerunStart - Called when a re-run is started
 *
 * @returns {React.FC<Props>} The scope band
 */
export const ReportScope: React.FC<Props> = ({ report, diff, onRerunStart }) => {
  const modelVersion = Number(report.model);
  const { data: desiredStateVersion } = useGetDesiredStateVersion(modelVersion);
  const modelVersionStatus = desiredStateVersion?.status;
  const { rows, statusValues } = useMemo(() => createReportScopeParts(report), [report]);
  const diffCounts = useMemo(() => diff && countDiff(diff), [diff]);
  const resourceFilter = report.resource_filter;
  const modelVersionText = words("modelVersion")(modelVersion);
  const isInactive = isKnownInactive(modelVersionStatus);

  const resourceCount = Number(report.total);
  const counts: ScopeCount[] = [
    {
      id: "resources",
      count: resourceCount,
      text:
        resourceFilter && desiredStateVersion
          ? words("desiredState.complianceCheck.scope.resourcesOfTotal")(
              Number(desiredStateVersion.total)
            )
          : words("desiredState.complianceCheck.scope.resources")(resourceCount),
    },
  ];

  if (diffCounts) {
    counts.push(
      {
        id: "agents",
        count: diffCounts.agentCount,
        text: words("desiredState.complianceCheck.scope.agents")(diffCounts.agentCount),
      },
      {
        id: "changed",
        count: diffCounts.changedCount,
        text: words("desiredState.complianceCheck.scope.changed"),
      }
    );
  }

  const hasBody = isInactive || Boolean(resourceFilter);

  return (
    <Card
      component="section"
      isCompact
      variant="secondary"
      aria-label={words("desiredState.complianceCheck.scope.title")}
    >
      <CardHeader>
        <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
          <CardTitle>{words("desiredState.complianceCheck.scope.title")}</CardTitle>
          {desiredStateVersion && (
            <DesiredStateStatusLabel status={desiredStateVersion.status}>
              {modelVersionText}
            </DesiredStateStatusLabel>
          )}
          {counts.map(({ id, count, text }, index) => (
            <React.Fragment key={id}>
              {index > 0 && <span aria-hidden>·</span>}
              <span>
                <strong>{count}</strong> {text}
              </span>
            </React.Fragment>
          ))}
        </Flex>
      </CardHeader>
      {hasBody && (
        <CardBody>
          <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
            {isInactive && (
              <Alert
                isInline
                isPlain
                variant="warning"
                title={words("desiredState.complianceCheck.scope.notActive")}
              >
                {words("desiredState.complianceCheck.scope.notActive.description")(
                  modelVersionText
                )}
              </Alert>
            )}
            {resourceFilter && (
              <AppliedFilter
                rows={rows}
                statusValues={statusValues}
                resourceFilter={resourceFilter}
                context={report.context}
                modelVersion={modelVersion}
                modelVersionStatus={modelVersionStatus}
                onRerunStart={onRerunStart}
              />
            )}
          </Flex>
        </CardBody>
      )}
    </Card>
  );
};
