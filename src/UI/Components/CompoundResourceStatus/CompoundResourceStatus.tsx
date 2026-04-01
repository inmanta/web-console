import { ReactNode } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { CubeIcon, ShieldAltIcon, TrafficLightIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { LegendBar } from "../LegendBar";
import { colorConfig, iconStyle, statusPriority } from "./config";

interface CompoundResourceProps {
  blocked: Record<Resource.BlockedStatus, number>;
  compliance: Record<Resource.ComplianceStatus, number>;
  lastHandlerRun: Record<Resource.LastHandlerRunStatus, number>;
  totalCount: number;
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

export const CompoundResourceStatus = (props: CompoundResourceProps) => {
  const { blocked, compliance, lastHandlerRun, totalCount, updateFilter } = props;

  if (!totalCount) return null;

  const statusRows: Array<{
    icon: ReactNode;
    testId: string;
    items: Array<{ status: Resource.CompoundStatus; value: number }>;
  }> = [
    {
      icon: <TrafficLightIcon style={iconStyle} />,
      testId: "legend-bar-blocked",
      items: [
        { status: Resource.BlockedStatus.blocked, value: blocked.blocked },
        { status: Resource.BlockedStatus.not_blocked, value: blocked.not_blocked },
        { status: Resource.BlockedStatus.temporarily_blocked, value: blocked.temporarily_blocked },
      ],
    },
    {
      icon: <ShieldAltIcon style={iconStyle} />,
      testId: "legend-bar-compliance",
      items: [
        { status: Resource.ComplianceStatus.compliant, value: compliance.compliant },
        { status: Resource.ComplianceStatus.has_update, value: compliance.has_update },
        { status: Resource.ComplianceStatus.non_compliant, value: compliance.non_compliant },
        { status: Resource.ComplianceStatus.undefined, value: compliance.undefined },
      ],
    },
    {
      icon: <CubeIcon style={iconStyle} />,
      testId: "legend-bar-last-handler-run",
      items: [
        { status: Resource.LastHandlerRunStatus.failed, value: lastHandlerRun.failed },
        { status: Resource.LastHandlerRunStatus.new, value: lastHandlerRun.new },
        { status: Resource.LastHandlerRunStatus.skipped, value: lastHandlerRun.skipped },
        { status: Resource.LastHandlerRunStatus.successful, value: lastHandlerRun.successful },
      ],
    },
  ];

  const onClick = (id: Resource.CompoundStatus) =>
    updateFilter((filter) => ({
      ...filter,
      status: [id],
    }));

  const toLegendBarItems = (items: Array<{ status: Resource.CompoundStatus; value: number }>) =>
    items
      .map(({ status, value }) => ({
        id: status,
        value,
        backgroundColor: colorConfig[status],
        label: status,
        onClick,
      }))
      .filter(({ value }) => value > 0)
      .sort((a, b) => statusPriority[a.id] - statusPriority[b.id]);

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }} flex={{ default: "flex_1" }}>
      {statusRows.map(({ icon, items, testId }, index) => (
        <Flex key={index} flex={{ default: "flex_1" }} alignItems={{ default: "alignItemsCenter" }}>
          <FlexItem>{icon}</FlexItem>
          <FlexItem flex={{ default: "flex_1" }}>
            <LegendBar
              data-testid={testId}
              items={toLegendBarItems(items)}
              aria-label={words("resources.deploySummary.title")}
            />
          </FlexItem>
        </Flex>
      ))}
    </Flex>
  );
};
