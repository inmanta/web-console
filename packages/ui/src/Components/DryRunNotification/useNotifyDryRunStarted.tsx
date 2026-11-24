import React, { useContext } from "react";
import { useLocation } from "react-router";
import { AlertActionLink } from "@patternfly/react-core";
import { EyeIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { StartedDryRun } from "@inmanta/web-console-core/Queries/Slices/Resource";
import { useNavigateTo } from "@inmanta/web-console-core/Routing";
import { createReportSearch } from "@inmanta/web-console-core/Routing/ReportSearch";

/**
 * Options of the "Dry run started" toast.
 */
interface NotifyDryRunStartedOptions {
  /** Whether the toast links to the new report on the Compliance Check page. */
  hasReportLink: boolean;
}

/**
 * Returns a function that shows the "Dry run started" toast. Its link opens the dry run's report on
 * the Compliance Check page, and is left out when the caller turns it off or the app has no
 * Compliance Check page.
 *
 * @example
 * const notifyDryRunStarted = useNotifyDryRunStarted({ hasReportLink: true });
 * notifyDryRunStarted({ id: "d1", modelVersion: 3 }); // toast linking to the report "d1" of version 3
 */
export const useNotifyDryRunStarted = ({
  hasReportLink,
}: NotifyDryRunStartedOptions): ((dryRun: StartedDryRun) => void) => {
  const { routeManager } = useContext(DependencyContext);
  const { notifyInfo } = useAppAlert();
  const navigateTo = useNavigateTo();
  const { search } = useLocation();

  const openReport = ({ id, modelVersion }: StartedDryRun) =>
    navigateTo(
      "ComplianceCheck",
      { version: String(modelVersion) },
      createReportSearch(search, id)
    );

  return (dryRun) =>
    notifyInfo({
      customIcon: <EyeIcon />,
      title: words("desiredState.complianceCheck.report.started"),
      actionLinks:
        hasReportLink && routeManager.has("ComplianceCheck") ? (
          <AlertActionLink onClick={() => openReport(dryRun)}>
            {words("desiredState.complianceCheck.report.view")}
          </AlertActionLink>
        ) : undefined,
    });
};
