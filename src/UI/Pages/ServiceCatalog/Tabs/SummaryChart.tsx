import { InstancesByLabel } from "@/Core";
import { words } from "@/UI/words";
import { ChartDonut } from "@patternfly/react-charts";
import {
  global_danger_color_100,
  global_info_color_100,
  global_palette_black_300,
  global_success_color_100,
  global_warning_color_100,
} from "@patternfly/react-tokens";
import React from "react";

interface Props {
  by_label: InstancesByLabel;
  total: number;
}

export const SummaryChart: React.FC<Props> = ({ by_label, total }) => {
  const chartData = getChartData(by_label);

  const legendData = chartData.map(({ x, y, color }) => ({
    name: `${x}: ${y}`,
    symbol: { fill: color },
  }));

  const colorScale = chartData.map((dataPoint) => dataPoint.color);

  return (
    <ChartDonut
      ariaTitle={words("catalog.summary.title")}
      constrainToVisibleArea={true}
      data={chartData}
      labels={({ datum }) => `${datum.x}: ${datum.y}`}
      legendData={legendData}
      legendOrientation="vertical"
      legendPosition="right"
      padding={{
        bottom: 20,
        left: 20,
        right: 140,
        top: 20,
      }}
      colorScale={colorScale}
      subTitle={words("catalog.instances")}
      title={`${total}`}
      width={350}
    />
  );
};

const colorsForChart = {
  danger: global_danger_color_100,
  warning: global_warning_color_100,
  success: global_success_color_100,
  info: global_info_color_100,
  no_label: global_palette_black_300,
};

const orderedLabels = ["danger", "warning", "success", "info", "no_label"];

interface ChartData {
  x: string;
  y: number;
  color: string;
}

function getChartData(by_label: InstancesByLabel): ChartData[] {
  return orderedLabels.map((label) => ({
    x: label === "no_label" ? words("catalog.summary.noLabel") : label,
    y: by_label[label],
    color: colorsForChart[label].value,
  }));
}
