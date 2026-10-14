import React from "react";
import { Alert, Card, CardBody, Flex } from "@patternfly/react-core";
import { Diff, Resource } from "@/Core";
import { useGetDesiredStateVersion } from "@/Data/Queries";
import { DesiredStateStatusLabel } from "@/UI/Components/DesiredStateStatusLabel";
import { words } from "@/UI/words";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";
import { AppliedFilter } from "./AppliedFilter";
import { getModelVersionLookup, isNotActiveVersion } from "./helpers";
import { useScopeRows } from "./useScopeRows";

interface Props {
  report: DryRun;
  diff: Diff.Resource[] | undefined;
  onRerunStart: () => void;
}

/**
 * Counts the agents and the changed resources in a dry run's diff.
 *
 * @example countDiff([{ resource_id: "std::File[a,path=/x]", status: "modified", ... }]) // { agentCount: 1, changedCount: 1 }
 */
const countDiff = (diff: Diff.Resource[]): { agentCount: number; changedCount: number } => ({
  agentCount: new Set(
    diff.flatMap(({ resource_id }) => Resource.IdParser.getAgentName(resource_id) ?? [])
  ).size,
  changedCount: diff.filter(({ status }) => Diff.changedStatuses.includes(status)).length,
});

/**
 * Shows what a dry run report covered, between the report picker and its diff. The scope line
 * shows the model version with its lifecycle status, and counts the resources (out of all
 * resources in the model version, for a dry run on a filter), agents and changes, so an empty diff
 * never reads as the whole model being compliant. A version that isn't active, or no longer exists,
 * gets a warning. A dry run started on a resource filter also shows that filter.
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
  const desiredStateVersionQuery = useGetDesiredStateVersion(modelVersion);
  const desiredStateVersion = desiredStateVersionQuery.data;
  const modelVersionLookup = getModelVersionLookup(desiredStateVersionQuery);
  const rows = useScopeRows(report);
  const resourceFilter = report.resource_filter;

  const resourceCount = Number(report.total);

  const resourcesText =
    resourceFilter && desiredStateVersion
      ? words("desiredState.complianceCheck.scope.resourcesOfTotal")(
          Number(desiredStateVersion.total)
        )
      : words("desiredState.complianceCheck.scope.resources")(resourceCount);

  const counts: [number, string][] = [[resourceCount, resourcesText]];

  if (diff) {
    const { agentCount, changedCount } = countDiff(diff);

    counts.push(
      [agentCount, words("desiredState.complianceCheck.scope.agents")(agentCount)],
      [changedCount, words("desiredState.complianceCheck.scope.changed")]
    );
  }

  return (
    <Card
      component="section"
      isCompact
      aria-label={words("desiredState.complianceCheck.scope.title")}
    >
      <CardBody>
        <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
          <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
            <strong>{words("desiredState.complianceCheck.scope.title")}</strong>
            {desiredStateVersion && (
              <DesiredStateStatusLabel status={desiredStateVersion.status}>
                {words("modelVersion")(modelVersion)}
              </DesiredStateStatusLabel>
            )}
            {counts.map(([count, text], index) => (
              <React.Fragment key={text}>
                {index > 0 && <span aria-hidden>·</span>}
                <span>
                  <strong>{count}</strong> {text}
                </span>
              </React.Fragment>
            ))}
          </Flex>
          {isNotActiveVersion(modelVersionLookup) && (
            <Alert
              isInline
              isPlain
              variant="warning"
              title={words("desiredState.complianceCheck.scope.notActive")}
            >
              {words("desiredState.complianceCheck.scope.notActive.description")(
                words("modelVersion")(modelVersion)
              )}
            </Alert>
          )}
          {resourceFilter && (
            <AppliedFilter
              rows={rows}
              resourceFilter={resourceFilter}
              modelVersion={modelVersion}
              modelVersionLookup={modelVersionLookup}
              onRerunStart={onRerunStart}
            />
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};
