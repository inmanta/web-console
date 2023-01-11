import React from "react";
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartThemeColor,
  ChartLegendTooltip,
  createContainer,
} from "@patternfly/react-charts";
interface Props {
  metricNames: string[];
  timestamps: string[];
  metrics: {
    name: string;
    data: number[];
  }[];
  minMax: number[];
}
export const LineChart: React.FC<Props> = ({
  metricNames,
  timestamps,
  metrics,
  minMax,
}) => {
  // Note: Container order is important
  const CursorVoronoiContainer = createContainer("voronoi", "cursor");

  const legendData = metricNames.map((key) => {
    const indentifier = key.split(".")[1];
    return {
      childName: key,
      name: indentifier.charAt(0).toUpperCase() + indentifier.slice(1),
    };
  });

  const min = Math.floor(minMax[0]);
  const max = Math.ceil(minMax[minMax.length - 1]);
  //TODO: Adjust StackChart and then merge it with Line Chart to avoid code duplication
  return (
    <div style={{ height: "300px", width: "1000px" }}>
      <Chart
        ariaDesc="Average number of pets"
        ariaTitle="Line chart example"
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={({ datum }) => `${datum.y}`}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
                title={(datum) => datum.x}
              />
            }
            mouseFollowTooltips
            voronoiDimension="x"
            voronoiPadding={50}
          />
        }
        legendData={legendData}
        legendPosition="bottom"
        height={300}
        maxDomain={{ y: max + max * 0.1 }}
        minDomain={{ y: min - min * 0.1 }}
        name="chart2"
        padding={{
          bottom: 75, // Adjusted to accommodate legend
          left: 50,
          right: 50,
          top: 50,
        }}
        themeColor={ChartThemeColor.green}
        width={1000}
      >
        <ChartAxis tickValues={[2, 3, 4]} />
        <ChartAxis
          dependentAxis
          showGrid
          tickValues={[min, (min + max) / 2, max]}
        />
        <ChartGroup>
          {metrics.map(({ name, data }, index) => (
            <ChartLine
              data={data.map((value, index) => {
                return { x: timestamps[index], y: value };
              })}
              name={name}
              key={name + index}
            />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};
