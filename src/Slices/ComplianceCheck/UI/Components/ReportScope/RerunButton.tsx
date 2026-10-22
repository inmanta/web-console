import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { DryRunContext, ResourceActionFilter, words } from "@/Core";
import { useDryRunFiltered } from "@/Data/Queries/Slices/Resource";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { createRerunPlan } from "./helpers";
import { RerunPlan } from "./types";

interface Props {
  resourceFilter: ResourceActionFilter;
  context?: DryRunContext | null;
  modelVersion: number;
  modelVersionStatus: DesiredStateVersionStatus | undefined;
  onRerunStart: () => void;
}

/**
 * Starts a new dry run with the same resource filter on the same model version as a report, which
 * then gets selected, like a dry run started from the page title. It stores the report's context as
 * is, so the new report shows the same instance labels. It is disabled, with the reason in a
 * tooltip, while the environment is halted, until the model version's status is known, and when the
 * filter can't target that version. It is also disabled while the re-run is starting.
 *
 * @props {Props} props - The props of the component
 *  @prop {ResourceActionFilter} resourceFilter - The resource filter the report was started with
 *  @prop {DryRunContext | null} [context] - The context the report was started with
 *  @prop {number} modelVersion - The model version of the report
 *  @prop {DesiredStateVersionStatus | undefined} modelVersionStatus - The status of that model
 *    version, undefined until it is known
 *  @prop {() => void} onRerunStart - Called when the re-run is started
 *
 * @returns {React.FC<Props>} The re-run button
 */
export const RerunButton: React.FC<Props> = ({
  resourceFilter,
  context,
  modelVersion,
  modelVersionStatus,
  onRerunStart,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifyError } = useAppAlert();
  const dryRun = useDryRunFiltered();

  const rerunPlan: RerunPlan | undefined =
    modelVersionStatus === undefined
      ? undefined
      : createRerunPlan(
          resourceFilter,
          modelVersion,
          modelVersionStatus === DesiredStateVersionStatus.active
        );

  const resolveDisabledReason = (): string | undefined => {
    if (isHalted) {
      return words("environment.halt.tooltip");
    }
    if (rerunPlan === undefined) {
      return words("desiredState.complianceCheck.scope.rerun.unknownStatus");
    }
    if (rerunPlan.kind === "blocked") {
      return words(`resources.resourceActions.confirm.version.blockedBy.${rerunPlan.blockedBy}`);
    }

    return undefined;
  };
  const disabledReason = resolveDisabledReason();

  const onClick = () => {
    if (rerunPlan?.kind !== "ready") {
      return;
    }

    onRerunStart();
    dryRun.mutate(
      { filter: rerunPlan.filter, context },
      {
        onError: (error) =>
          notifyError({
            title: words("desiredState.complianceCheck.scope.rerun.failed"),
            message: error.message,
          }),
      }
    );
  };

  return (
    <ActionDisabledTooltip
      testingId="RerunDryRun"
      tooltipContent={disabledReason}
      isDisabled={Boolean(disabledReason)}
    >
      <Button
        variant="link"
        isInline
        isDisabled={Boolean(disabledReason) || dryRun.isPending}
        onClick={onClick}
      >
        {words("desiredState.complianceCheck.scope.rerun")}
      </Button>
    </ActionDisabledTooltip>
  );
};
