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
 * Returns a function that shows the "Dry run started" toast. Its link opens the dry run's report on
 * the Compliance Check page, and is left out when the app has no Compliance Check page.
 *
 * @example
 * const notifyDryRunStarted = useNotifyDryRunStarted();
 * notifyDryRunStarted({ id: "d1", modelVersion: 3 }); // toast linking to the report "d1" of version 3
 */
export const useNotifyDryRunStarted = (): ((dryRun: StartedDryRun) => void) => {
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
      actionLinks: routeManager.has("ComplianceCheck") ? (
        <AlertActionLink onClick={() => openReport(dryRun)}>
          {words("desiredState.complianceCheck.report.view")}
        </AlertActionLink>
      ) : undefined,
    });
};
