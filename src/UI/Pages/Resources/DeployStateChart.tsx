import React from "react";
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegend,
  ChartStack,
  ChartTooltip,
} from "@patternfly/react-charts";
import {
  global_danger_color_100,
  global_palette_black_200,
  global_palette_black_400,
  global_palette_cyan_200,
  global_primary_color_100,
  global_success_color_100,
  global_warning_color_100,
} from "@patternfly/react-tokens";
import { Resource } from "@/Core";
import { words } from "@/UI";

interface Props {
  summary: Resource.DeploySummary;
}

export const DeployStateChart: React.FC<Props> = ({ summary }) => {
  const done = getResourcesInDoneState(summary.by_state || {});
  return (
    <div style={{ height: "20px", width: "500px" }}>
      <Chart
        ariaTitle={words("resources.deploySummary.title")}
        height={20}
        width={500}
        domain={{ y: [0, Math.max(summary.total, 1)] }}
        legendPosition="right"
        legendComponent={<ChartLegend title={`${done} / ${summary.total}`} />}
        legendData={[]}
        padding={{ right: 100 }}
        style={{ background: { fill: global_palette_black_200.value } }}
      >
        <ChartAxis
          dependentAxis
          crossAxis={false}
          tickCount={1}
          style={{
            tickLabels: { opacity: 0 },
            ticks: { opacity: 0 },
            axis: { opacity: 0 },
          }}
        />
        <ChartStack horizontal>
          {getDataforBars(summary.by_state).map((barData) => (
            <ChartBar
              key={barData.name}
              data={[barData]}
              style={{ data: { fill: barData.color } }}
              barWidth={20}
              labelComponent={<ChartTooltip />}
            />
          ))}
        </ChartStack>
      </Chart>
    </div>
  );
};

function getResourcesInDoneState(by_state: Record<string, number>): number {
  return Object.entries(by_state)
    .filter(([key]) => !Resource.TRANSIENT_STATES.includes(key))
    .map(([, value]) => value)
    .reduce((acc, current) => acc + current, 0);
}

interface BarData {
  name: string;
  x: number;
  y: number;
  color: string;
  label: string;
}

function getDataforBars(by_state: Record<string, number>): BarData[] {
  return infos
    .map((info) => addTotal(info, by_state))
    .filter((info) => info.total > 0)
    .map((info) => ({
      name: info.keys[0],
      x: 1,
      y: info.total,
      color: info.color,
      label: info.keys.reduce((acc, cur) => `${acc} & ${cur}`),
    }));
}

function addTotal(info: Info, byState: Record<string, number>): InfoWithTotal {
  return {
    ...info,
    total: info.keys
      .map((key) => (byState[key] === undefined ? 0 : byState[key]))
      .reduce((acc, cur) => acc + cur, 0),
  };
}

interface Info {
  keys: string[];
  color: string;
}

interface InfoWithTotal extends Info {
  total: number;
}

const infos: Info[] = [
  { keys: ["deployed"], color: global_success_color_100.value },
  {
    keys: ["skipped", "skipped_for_undefined", "cancelled"],
    color: global_palette_cyan_200.value,
  },
  {
    keys: ["failed"],
    color: global_danger_color_100.value,
  },
  {
    keys: ["unavailable", "undefined"],
    color: global_warning_color_100.value,
  },
  {
    keys: ["deploying"],
    color: global_primary_color_100.value,
  },
  {
    keys: ["available", "processing_events"],
    color: global_palette_black_400.value,
  },
];
