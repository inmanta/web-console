import React, { useContext } from "react";
import { Link } from "react-router";
import { Button, Content, Flex, FlexItem, Truncate } from "@patternfly/react-core";
import { CheckCircleIcon, InfoAltIcon, TimesCircleIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { CompileStatus } from "@inmanta/web-console-core/Domain";
import { CompileReport } from "@inmanta/web-console-core/Domain/CompileReport";
import { getStatusFromReport } from "@inmanta/web-console-core/Domain/CompileReport";
import { DateWithTooltip } from "@inmanta/web-console-ui/Components/DateWithTooltip";
import { Spinner } from "@inmanta/web-console-ui/Components/Spinner";
import { CustomDatePresenter } from "@inmanta/web-console-ui/Utils";
import { IconBadge } from "../IconBadge";

const datePresenter = new CustomDatePresenter();

const STATUS_ICON: Record<CompileStatus, React.ReactNode> = {
  [CompileStatus.success]: (
    <IconBadge $tone="success" $size="sm">
      <CheckCircleIcon />
    </IconBadge>
  ),
  [CompileStatus.failed]: (
    <IconBadge $tone="danger" $size="sm">
      <TimesCircleIcon />
    </IconBadge>
  ),
  [CompileStatus.inprogress]: (
    <IconBadge $tone="brand" $size="sm">
      <Spinner />
    </IconBadge>
  ),
  [CompileStatus.queued]: (
    <IconBadge $tone="info" $size="sm">
      <InfoAltIcon />
    </IconBadge>
  ),
};

interface Props {
  report: CompileReport;
}

/**
 * One row of the Latest Compile Reports panel: status icon, trigger-type label + the
 * API-provided message, duration (or a running indicator), relative time, and a link to the
 * compile's detail page.
 */
export const LatestCompileReportRow: React.FC<Props> = ({ report }) => {
  const { routeManager } = useContext(DependencyContext);
  const status = getStatusFromReport(report);
  const isInProgress = status === CompileStatus.inprogress;
  const isRunning = isInProgress || status === CompileStatus.queued;
  // The compile report is a page of the orchestration engine, only linked when the app has it.
  const detailsUrl = routeManager.has("CompileDetails")
    ? routeManager.getUrl("CompileDetails", { id: report.id })
    : undefined;
  const trigger = report.metadata["type"] as string | undefined;

  return (
    <Flex
      justifyContent={{ default: "justifyContentSpaceBetween" }}
      alignItems={{ default: "alignItemsCenter" }}
      flexWrap={{ default: "nowrap" }}
    >
      <Flex
        alignItems={{ default: "alignItemsCenter" }}
        spaceItems={{ default: "spaceItemsSm" }}
        flex={{ default: "flex_1" }}
        style={{ minWidth: 0 }}
      >
        <FlexItem>{STATUS_ICON[status]}</FlexItem>
        {trigger && (
          <FlexItem>
            <Content component="p" style={{ fontWeight: 700 }}>
              {trigger} -
            </Content>
          </FlexItem>
        )}
        <FlexItem flex={{ default: "flex_1" }} style={{ minWidth: 0 }}>
          <Content component="p">
            <Truncate content={report.metadata["message"] as string} />
          </Content>
        </FlexItem>
      </Flex>
      <Flex
        alignItems={{ default: "alignItemsCenter" }}
        spaceItems={{ default: "spaceItemsMd" }}
        style={{ flexShrink: 0 }}
      >
        {isRunning ? (
          <>
            <FlexItem>
              <Content
                component="small"
                style={{
                  fontWeight: 700,
                  color: isInProgress
                    ? "var(--pf-t--global--text--color--brand--default)"
                    : "var(--pf-t--global--text--color--status--info--default)",
                }}
              >
                {isInProgress
                  ? words("dashboard.compileReports.running")
                  : words("dashboard.compileReports.queued")}
              </Content>
            </FlexItem>
            {report.started && (
              <FlexItem>
                <Content component="small">
                  {words("dashboard.compileReports.startedAgo")}{" "}
                  <DateWithTooltip timestamp={report.started} />
                </Content>
              </FlexItem>
            )}
          </>
        ) : (
          <>
            <FlexItem>
              <Content component="small">
                {report.started && report.completed
                  ? datePresenter.diff(report.completed, report.started)
                  : ""}
              </Content>
            </FlexItem>
            <FlexItem>
              <Content component="small">
                <DateWithTooltip timestamp={report.requested} />
              </Content>
            </FlexItem>
          </>
        )}
        {detailsUrl && (
          <FlexItem>
            <Link to={{ pathname: detailsUrl, search: location.search }}>
              <Button variant="link" isInline>
                {isRunning
                  ? words("dashboard.compileReports.viewProgress")
                  : words("dashboard.compileReports.viewReport")}{" "}
                &gt;
              </Button>
            </Link>
          </FlexItem>
        )}
      </Flex>
    </Flex>
  );
};
