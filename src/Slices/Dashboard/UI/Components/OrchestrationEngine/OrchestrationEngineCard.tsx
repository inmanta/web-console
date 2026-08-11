import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { CodeIcon, OutlinedCalendarAltIcon, SyncIcon } from "@patternfly/react-icons";
import {
  chart_color_blue_300,
  chart_color_orange_300,
  chart_color_purple_200,
} from "@patternfly/react-tokens";
import { CompileStatus, DateRange, PageSize, RangeOperator } from "@/Core";
import { useGetCompileReports, useGetMetrics } from "@/Data/Queries";
import { words } from "@/UI/words";
import dayjs from "@/dayjs";
import {
  average,
  deriveNbDatapoints,
  getTrendSeries,
  OrchestrationEngineTab,
} from "../../orchestrationEngineMetrics";
import { IconBadge } from "../IconBadge";
import { TrendChart } from "./TrendChart";

type RangeDays = 7 | 14 | 30;

const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: words("dashboard.orchestrationEngine.range.last7Days") },
  { value: 14, label: words("dashboard.orchestrationEngine.range.last14Days") },
  { value: 30, label: words("dashboard.orchestrationEngine.range.last30Days") },
];

interface TabConfig {
  key: OrchestrationEngineTab;
  label: string;
  chartTitle: string;
  color: string;
  formatValue: (value: number) => string;
}

const TABS: TabConfig[] = [
  {
    key: "rate",
    label: words("dashboard.orchestrationEngine.tabs.rate"),
    chartTitle: words("dashboard.orchestrationEngine.chart.rate.title"),
    color: chart_color_orange_300.var,
    formatValue: (value) => value.toFixed(2),
  },
  {
    key: "time",
    label: words("dashboard.orchestrationEngine.tabs.time"),
    chartTitle: words("dashboard.orchestrationEngine.chart.time.title"),
    color: chart_color_blue_300.var,
    formatValue: (value) => `${value.toFixed(2)}s`,
  },
  {
    key: "waiting",
    label: words("dashboard.orchestrationEngine.tabs.waiting"),
    chartTitle: words("dashboard.orchestrationEngine.chart.waiting.title"),
    color: chart_color_purple_200.var,
    formatValue: (value) => `${value.toFixed(2)}s`,
  },
];

interface StatItemProps {
  testId: string;
  value: string;
  label: string;
  isDanger?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ testId, value, label, isDanger }) => (
  <FlexItem data-testid={`orchestration-engine-stat-${testId}`}>
    <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsNone" }}>
      <FlexItem>
        <Content
          component="h2"
          style={{
            margin: 0,
            color: isDanger
              ? "var(--pf-t--global--text--color--status--danger--default)"
              : undefined,
          }}
        >
          {value}
        </Content>
      </FlexItem>
      <FlexItem>
        <Content component="small">{label}</Content>
      </FlexItem>
    </Flex>
  </FlexItem>
);

const formatSeconds = (seconds: number | null): string =>
  seconds === null ? "—" : `${seconds.toFixed(2)}s`;

/**
 * Orchestration Engine card: compile rate/time/waiting-time trend over a selectable last-N-days
 * window, sourced from the same /api/v2/metrics endpoint as the V1 Dashboard, plus a
 * Compiles/Failed count sourced from the Compile Reports endpoint filtered to the same window
 * (the metrics endpoint has no failure breakdown to derive that from). The range picker and
 * refresh button sit above the card (not in its header) since they're the only controls in the
 * dashboard that affect a time range rather than showing live/current state.
 */
export const OrchestrationEngineCard: React.FC = () => {
  const [tab, setTab] = useState<OrchestrationEngineTab>("rate");
  const [days, setDays] = useState<RangeDays>(7);
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  // Recomputed from "now" on every range change or refresh click, rather than fixed once at
  // mount - each recompute produces a new startDate/endDate, and since those feed straight into
  // the query keys below, React Query naturally refetches without needing an explicit refetch()
  // call, mirroring the V1 Dashboard's own refresh button (Dashboard.tsx's updateCharts).
  const [startDate, setStartDate] = useState(() => dayjs().subtract(7, "days"));
  const [endDate, setEndDate] = useState(() => dayjs());

  const applyRange = (nextDays: RangeDays): void => {
    setDays(nextDays);
    setStartDate(dayjs().subtract(nextDays, "days"));
    setEndDate(dayjs());
  };

  const handleRefresh = (): void => {
    setStartDate(dayjs().subtract(days, "days"));
    setEndDate(dayjs());
  };

  const { data: metrics } = useGetMetrics().useOneTime({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isLsmAvailable: false,
    nbDatapoints: deriveNbDatapoints(days),
  });

  const requestedRange: DateRange.DateRange[] = [
    { date: startDate.toDate(), operator: RangeOperator.Operator.From },
    { date: endDate.toDate(), operator: RangeOperator.Operator.To },
  ];

  const { data: allCompiles } = useGetCompileReports({
    pageSize: PageSize.minimal,
    currentPage: { kind: "CurrentPage", value: "" },
    filter: { requested: requestedRange },
  }).useContinuous();

  const { data: failedCompiles } = useGetCompileReports({
    pageSize: PageSize.minimal,
    currentPage: { kind: "CurrentPage", value: "" },
    filter: { requested: requestedRange, status: CompileStatus.failed },
  }).useContinuous();

  const activeTab = TABS.find((candidate) => candidate.key === tab) ?? TABS[0];
  const activeRangeLabel = RANGE_OPTIONS.find((option) => option.value === days)?.label ?? "";
  const trend = getTrendSeries(metrics, tab);
  const avgCompileSeconds = average(metrics?.metrics["orchestrator.compile_time"]);
  const avgWaitingSeconds = average(metrics?.metrics["orchestrator.compile_waiting_time"]);

  return (
    <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsMd" }}>
      <Flex
        justifyContent={{ default: "justifyContentFlexEnd" }}
        spaceItems={{ default: "spaceItemsSm" }}
      >
        <FlexItem>
          <Dropdown
            isOpen={isRangeOpen}
            onOpenChange={setIsRangeOpen}
            onSelect={() => setIsRangeOpen(false)}
            popperProps={{ position: "end" }}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                variant="secondary"
                icon={<OutlinedCalendarAltIcon />}
                isExpanded={isRangeOpen}
                onClick={() => setIsRangeOpen(!isRangeOpen)}
              >
                {activeRangeLabel}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {RANGE_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  isSelected={option.value === days}
                  onClick={() => applyRange(option.value)}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" icon={<SyncIcon />} onClick={handleRefresh}>
            {words("dashboard.orchestrationEngine.refresh")}
          </Button>
        </FlexItem>
      </Flex>
      <FlexItem>
        <Card>
          <CardHeader
            actions={{
              hasNoOffset: true,
              actions: (
                <ToggleGroup aria-label={words("dashboard.orchestrationEngine.title")}>
                  {TABS.map((tabConfig) => (
                    <ToggleGroupItem
                      key={tabConfig.key}
                      text={tabConfig.label}
                      buttonId={`orchestration-engine-tab-${tabConfig.key}`}
                      isSelected={tab === tabConfig.key}
                      onChange={() => setTab(tabConfig.key)}
                    />
                  ))}
                </ToggleGroup>
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
                <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsNone" }}>
                  <FlexItem>
                    <Content component="h3">{words("dashboard.orchestrationEngine.title")}</Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component="small">
                      {words("dashboard.orchestrationEngine.subtitle")(days)}
                    </Content>
                  </FlexItem>
                </Flex>
              </Flex>
            </CardTitle>
          </CardHeader>
          <Divider />
          <CardBody>
            <Flex spaceItems={{ default: "spaceItemsXl" }} columnGap={{ default: "columnGapXl" }}>
              <StatItem
                testId="compiles"
                value={(Number(allCompiles?.metadata.total) || 0).toLocaleString()}
                label={words("dashboard.orchestrationEngine.stats.compiles")}
              />
              <StatItem
                testId="failed"
                value={(Number(failedCompiles?.metadata.total) || 0).toLocaleString()}
                label={words("dashboard.orchestrationEngine.stats.failed")}
                isDanger
              />
              <StatItem
                testId="avg-compile"
                value={formatSeconds(avgCompileSeconds)}
                label={words("dashboard.orchestrationEngine.stats.avgCompile")}
              />
              <StatItem
                testId="avg-waiting"
                value={formatSeconds(avgWaitingSeconds)}
                label={words("dashboard.orchestrationEngine.stats.avgWaiting")}
              />
            </Flex>
          </CardBody>
          <CardBody>
            <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
              <FlexItem>
                <Content component="p" style={{ fontWeight: 700, margin: 0 }}>
                  {activeTab.chartTitle}
                </Content>
              </FlexItem>
              <FlexItem>
                <TrendChart
                  data={trend.data}
                  timestamps={metrics?.timestamps ?? []}
                  max={trend.max}
                  color={activeTab.color}
                  formatValue={activeTab.formatValue}
                  xStartLabel={words("dashboard.orchestrationEngine.chart.xStart")(days)}
                  xEndLabel={words("dashboard.orchestrationEngine.chart.xEnd")}
                  ariaLabel={activeTab.chartTitle}
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </FlexItem>
    </Flex>
  );
};
