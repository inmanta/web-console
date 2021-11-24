import React from "react";
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegend,
  ChartStack,
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
import { ResourceDeploySummary, TRANSIENT_STATES } from "@/Core";
import { words } from "@/UI";

interface Props {
  summary: ResourceDeploySummary;
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
          {getBarsForResourcesByState(summary.by_state)}
        </ChartStack>
      </Chart>
    </div>
  );
};

function getResourcesInDoneState(by_state: Record<string, number>): number {
  return Object.entries(by_state)
    .filter(([key]) => !TRANSIENT_STATES.includes(key))
    .map(([, value]) => value)
    .reduce((acc, current) => acc + current, 0);
}

function getBarsForResourcesByState(
  by_state: Record<string, number>
): React.ReactElement[] {
  return statesInOrder
    .filter((state) => by_state[state] !== undefined)
    .map((state) => (
      <ChartBar
        key={state}
        data={[{ name: state, x: "1", y: by_state[state] }]}
        style={{ data: { fill: stateToColor[state].value } }}
        barWidth={20}
      />
    ));
}

const stateToColor = {
  deployed: global_success_color_100,
  skipped: global_palette_cyan_200,
  skipped_for_undefined: global_palette_cyan_200,
  cancelled: global_palette_cyan_200,
  failed: global_danger_color_100,
  unavailable: global_warning_color_100,
  undefined: global_warning_color_100,
  deploying: global_primary_color_100,
  available: global_palette_black_400,
  processing_events: global_palette_black_400,
};

const statesInOrder = [
  "deployed",
  "deploying",
  "available",
  "processing_events",
  "skipped",
  "skipped_for_undefined",
  "unavailable",
  "undefined",
  "failed",
];
