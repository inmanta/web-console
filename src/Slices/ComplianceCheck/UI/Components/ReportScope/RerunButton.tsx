import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ResourceActionFilter, useDryRunFiltered } from "@/Data/Queries";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { ModelVersionLookup, RerunFilter, getKnownStatus, getRerunFilter } from "./helpers";

interface Props {
  resourceFilter: ResourceActionFilter;
  modelVersion: number;
  modelVersionLookup: ModelVersionLookup;
  onRerunStart: () => void;
}

/**
 * Starts a new dry run with the same resource filter on the same model version as a report, which
 * then gets selected, like a dry run started from the page title. It is disabled while the
 * environment is halted, while it isn't known yet whether the model version is active, when that
 * version no longer exists or couldn't be looked up, and when the filter can't target an older
 * model version.
 *
 * @props {Props} props - The props of the component
 *  @prop {ResourceActionFilter} resourceFilter - The resource filter the report was started with
 *  @prop {number} modelVersion - The model version of the report
 *  @prop {ModelVersionLookup} modelVersionLookup - What is known about that model version
 *  @prop {() => void} onRerunStart - Called when the re-run is started
 *
 * @returns {React.FC<Props>} The re-run button
 */
export const RerunButton: React.FC<Props> = ({
  resourceFilter,
  modelVersion,
  modelVersionLookup,
  onRerunStart,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifyError } = useAppAlert();
  const dryRun = useDryRunFiltered();

  const versionStatus = getKnownStatus(modelVersionLookup);
  const rerunFilter: RerunFilter | undefined = versionStatus
    ? getRerunFilter(
        resourceFilter,
        modelVersion,
        versionStatus === DesiredStateVersionStatus.active
      )
    : undefined;

  const getDisabledReason = (): string | undefined => {
    if (isHalted) {
      return words("environment.halt.tooltip");
    }
    if (modelVersionLookup === "missing" || modelVersionLookup === "failed") {
      return words(`desiredState.complianceCheck.scope.rerun.blockedBy.${modelVersionLookup}`);
    }
    if (rerunFilter && "blockedBy" in rerunFilter) {
      return words(`resources.resourceActions.confirm.version.blockedBy.${rerunFilter.blockedBy}`);
    }

    return undefined;
  };
  const disabledReason = getDisabledReason();

  const onClick = () => {
    if (!rerunFilter || "blockedBy" in rerunFilter) {
      return;
    }

    onRerunStart();
    dryRun.mutate(rerunFilter.filter, {
      onError: (error) =>
        notifyError({
          title: words("desiredState.complianceCheck.scope.rerun.failed"),
          message: error.message,
        }),
    });
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
        isDisabled={Boolean(disabledReason) || !rerunFilter || dryRun.isPending}
        onClick={onClick}
      >
        {words("desiredState.complianceCheck.scope.rerun")}
      </Button>
    </ActionDisabledTooltip>
  );
};
