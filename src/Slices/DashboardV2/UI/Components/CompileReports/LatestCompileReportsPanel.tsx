import React, { useContext } from "react";
import { Link } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { CodeIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { useLatestCompileReports } from "../../useLatestCompileReports";
import { IconBadge } from "../IconBadge";
import { LatestCompileReportRow } from "./LatestCompileReportRow";

/**
 * Latest Compile Reports panel: title + "View all" link, and the most recent compile reports.
 */
export const LatestCompileReportsPanel: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const compileReportsUrl = routeManager.useUrl("CompileReports", undefined);

  const { data } = useLatestCompileReports();

  const reports = data?.data ?? [];

  return (
    <Card>
      <CardHeader
        actions={{
          // Default false applies a negative margin calibrated for a plain-text CardTitle;
          // ours is taller (icon + text), so that offset would misalign the action against it.
          hasNoOffset: true,
          actions: (
            <Link to={compileReportsUrl}>
              <Button variant="link" isInline>
                {words("dashboardV2.compileReports.viewAll")}
              </Button>
            </Link>
          ),
        }}
      >
        <CardTitle>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsSm" }}
          >
            <FlexItem>
              <IconBadge $tone="warning">
                <CodeIcon />
              </IconBadge>
            </FlexItem>
            <FlexItem>{words("dashboardV2.compileReports.title")}</FlexItem>
          </Flex>
        </CardTitle>
      </CardHeader>
      <Divider />
      <CardBody>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsMd" }}>
          {reports.length === 0 ? (
            <FlexItem>
              <Content component="small">{words("dashboardV2.compileReports.empty")}</Content>
            </FlexItem>
          ) : (
            reports.map((report) => (
              <FlexItem key={report.id}>
                <LatestCompileReportRow report={report} />
              </FlexItem>
            ))
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};
