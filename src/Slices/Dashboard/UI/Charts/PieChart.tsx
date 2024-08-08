import React from "react";
import { ChartPie, ChartThemeColor } from "@patternfly/react-charts";
interface Props {
  name: string;
  metrics: {
    x: string;
    y: number;
  }[];
}
export const PieChart: React.FC<Props> = ({ metrics, name }) => (
  <div style={{ height: "275px", width: "300px" }}>
    <ChartPie
      ariaDesc="Average number of pets"
      ariaTitle="Pie chart example"
      constrainToVisibleArea
      data={metrics}
      height={275}
      labels={({ datum }) => `${datum.x}: ${datum.y}`}
      legendData={metrics.map((metric) => {
        return { name: `${metric.x}: ${metric.y}` };
      })}
      legendPosition="bottom"
      name={name}
      padding={{
        bottom: 65,
        left: 20,
        right: 20,
        top: 20,
      }}
      themeColor={ChartThemeColor.multiOrdered}
      width={300}
    />
  </div>
);
