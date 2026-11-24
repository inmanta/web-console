import React, { useContext, useMemo, useState } from "react";
import {
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from "@patternfly/react-core";
import { CrosshairsIcon, CubeIcon, EyeIcon } from "@patternfly/react-icons";
import { DryRun, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { DesiredStateVersionStatus } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import { useGetDesiredStateVersion } from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import { useTriggerDryRun } from "@inmanta/web-console-core/Queries/Slices/DryRun";
import { useDryRunFiltered } from "@inmanta/web-console-core/Queries/Slices/Resource";
import { ActionDisabledTooltip } from "@inmanta/web-console-ui/Components/ActionDisabledTooltip";
import { useNotifyDryRunStarted } from "@inmanta/web-console-ui/Components/DryRunNotification";
import { createReportScopeParts } from "../ReportScope/helpers";
import { createReportScopeDryRunPlan } from "./helpers";

const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

interface Props {
  version: string;
  report: DryRun | null;
  onDryRunStart: () => void;
}

/**
 * The Dry run split button of the Compliance Check page. The main action and "Full model" start a
 * dry run on the whole model version. "This report's scope" starts one with the selected report's
 * filter on its model version, and is disabled, with the reason in a tooltip, when there is no
 * report, when the report covers the full model, until the model version's status is known, and
 * when the filter can't target that version. The whole button is disabled while the environment is
 * halted and while a dry run is starting. A started dry run shows the "Dry run started" toast.
 *
 * @props {Props} props - The component props
 * @prop {string} version - The model version of the page, which all its reports are on
 * @prop {DryRun | null} report - The selected report, null when there is none
 * @prop {() => void} onDryRunStart - Called when a dry run is started
 *
 * @returns {React.FC<Props>} The Dry run split button
 */
export const TriggerDryRunAction: React.FC<Props> = ({ version, report, onDryRunStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifyError } = useAppAlert();
  const modelVersion = Number(version);
  const { data: desiredStateVersion } = useGetDesiredStateVersion(modelVersion);
  const notifyDryRunStarted = useNotifyDryRunStarted({ hasReportLink: false });
  const notifyDryRunFailed = (error: Error) =>
    notifyError({
      title: words("desiredState.complianceCheck.action.dryRun.failed"),
      message: error.message,
    });

  const fullModelDryRun = useTriggerDryRun({
    onSuccess: (id) => notifyDryRunStarted({ id, modelVersion }),
    onError: notifyDryRunFailed,
  });
  const reportScopeDryRun = useDryRunFiltered({
    onSuccess: notifyDryRunStarted,
    onError: notifyDryRunFailed,
  });

  const resourceFilter = report?.resource_filter;
  const isReportFiltered = useMemo(
    () => (report ? createReportScopeParts(report).isFiltered : false),
    [report]
  );
  const modelVersionStatus = desiredStateVersion?.status;
  const reportScopeDryRunPlan =
    resourceFilter && modelVersionStatus !== undefined
      ? createReportScopeDryRunPlan(
          resourceFilter,
          modelVersion,
          modelVersionStatus === DesiredStateVersionStatus.active
        )
      : undefined;

  const getReportScopeDisabledReason = (): string | undefined => {
    if (!report) {
      return words("desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.noReport");
    }
    if (!isReportFiltered) {
      return words("desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.fullModel");
    }
    if (reportScopeDryRunPlan === undefined) {
      return words(
        "desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.unknownStatus"
      );
    }
    if (reportScopeDryRunPlan.kind === "blocked") {
      return words(
        `resources.resourceActions.confirm.version.blockedBy.${reportScopeDryRunPlan.blockedBy}`
      );
    }

    return undefined;
  };
  const reportScopeDisabledReason = getReportScopeDisabledReason();

  const isDisabled = isHalted || fullModelDryRun.isPending || reportScopeDryRun.isPending;

  const startFullModelDryRun = () => {
    setIsOpen(false);
    onDryRunStart();
    fullModelDryRun.mutate(version);
  };

  const startReportScopeDryRun = () => {
    setIsOpen(false);

    if (reportScopeDryRunPlan?.kind !== "ready") {
      return;
    }

    onDryRunStart();
    // The report's context goes along as is, so the new report shows the same instance labels.
    reportScopeDryRun.mutate({ filter: reportScopeDryRunPlan.filter, context: report?.context });
  };

  const toggle = (ref: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={ref}
      variant="secondary"
      isExpanded={isOpen}
      isDisabled={isDisabled}
      onClick={() => setIsOpen(!isOpen)}
      aria-label={words("desiredState.complianceCheck.action.dryRun.toggle")}
      splitButtonItems={[
        <MenuToggleAction key="full-model" isDisabled={isDisabled} onClick={startFullModelDryRun}>
          <Flex
            component="span"
            gap={{ default: "gapSm" }}
            alignItems={{ default: "alignItemsCenter" }}
            flexWrap={{ default: "nowrap" }}
          >
            <Icon isInline size="sm">
              <EyeIcon />
            </Icon>
            {words("desiredState.complianceCheck.action.dryRun")}
          </Flex>
        </MenuToggleAction>,
      ]}
    />
  );

  const dropdown = (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      toggle={toggle}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        <DropdownItem
          icon={
            <Icon size="sm">
              <CubeIcon style={iconStyle} />
            </Icon>
          }
          onClick={startFullModelDryRun}
        >
          <ItemText
            label={words("desiredState.complianceCheck.scope.fullModel")}
            hint={
              desiredStateVersion
                ? words("desiredState.complianceCheck.action.dryRun.fullModel.hint")(
                    Number(desiredStateVersion.total)
                  )
                : undefined
            }
          />
        </DropdownItem>
        <DropdownItem
          icon={
            <Icon size="sm">
              <CrosshairsIcon style={iconStyle} />
            </Icon>
          }
          onClick={startReportScopeDryRun}
          isAriaDisabled={Boolean(reportScopeDisabledReason)}
          tooltipProps={
            reportScopeDisabledReason ? { content: reportScopeDisabledReason } : undefined
          }
        >
          <ItemText
            label={words("desiredState.complianceCheck.action.dryRun.reportScope")}
            hint={
              report
                ? words("desiredState.complianceCheck.action.dryRun.reportScope.hint")(
                    Number(report.total)
                  )
                : undefined
            }
          />
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  return isHalted ? (
    <ActionDisabledTooltip
      testingId="TriggerDryRun"
      tooltipContent={words("environment.halt.tooltip")}
      isDisabled
    >
      {dropdown}
    </ActionDisabledTooltip>
  ) : (
    dropdown
  );
};

/**
 * The text of a dry run scope in the menu: its label, with a hint on the right.
 *
 * @props {{ label: string; hint?: string }} props - The component props
 * @prop {string} label - The name of the scope
 * @prop {string} [hint] - The hint on the right, left out until it is known
 *
 * @returns {React.FC<{ label: string; hint?: string }>} The text of a menu item
 */
const ItemText: React.FC<{ label: string; hint?: string }> = ({ label, hint }) => (
  <Flex
    justifyContent={{ default: "justifyContentSpaceBetween" }}
    alignItems={{ default: "alignItemsCenter" }}
    columnGap={{ default: "columnGapMd" }}
  >
    <FlexItem>{label}</FlexItem>
    {hint && (
      <FlexItem>
        <Content component="small">{hint}</Content>
      </FlexItem>
    )}
  </Flex>
);
