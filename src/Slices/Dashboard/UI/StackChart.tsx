import React from "react";
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartStack,
  ChartLegendTooltip,
  ChartThemeColor,
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
export const StackChart: React.FC<Props> = () => {
  // Note: Container order is important
  const CursorVoronoiContainer = createContainer("voronoi", "cursor");
  const legendData = [
    { childName: "cats", name: "Cats" },
    { childName: "dogs", name: "Dogs" },
    { childName: "birds", name: "Birds" },
  ];
  //TODO: Adjust StackChart and then merge it with Line Chart to avoid code duplication
  return (
    <div style={{ height: "300px", width: "1000px" }}>
      <Chart
        ariaDesc="Average number of pets"
        ariaTitle="Area chart example"
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={({ datum }) => `${datum.y !== null ? datum.y : "no data"}`}
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
        name="chart5"
        padding={{
          bottom: 75, // Adjusted to accomodate legend
          left: 50,
          right: 50,
          top: 50,
        }}
        maxDomain={{ y: 30 }}
        themeColor={ChartThemeColor.multiUnordered}
        width={1000}
      >
        <ChartAxis />
        <ChartAxis dependentAxis showGrid />
        <ChartStack>
          <ChartArea
            data={[
              { x: "Sunday", y: 6 },
              { x: "Monday", y: 2 },
              { x: "Tuesday", y: 8 },
              { x: "Wednesday", y: 15 },
              { x: "Thursday", y: 6 },
              { x: "Friday", y: 2 },
              { x: "Saturday", y: 0 },
            ]}
            interpolation="monotoneX"
            name="cats"
          />
          <ChartArea
            data={[
              { x: "Sunday", y: 4 },
              { x: "Monday", y: 5 },
              { x: "Tuesday", y: 7 },
              { x: "Wednesday", y: 6 },
              { x: "Thursday", y: 10 },
              { x: "Friday", y: 3 },
              { x: "Saturday", y: 5 },
            ]}
            interpolation="monotoneX"
            name="dogs"
          />
          <ChartArea
            data={[
              { x: "Sunday", y: 8 },
              { x: "Monday", y: 18 },
              { x: "Tuesday", y: 14 },
              { x: "Wednesday", y: 8 },
              { x: "Thursday", y: 6 },
              { x: "Friday", y: 8 },
              { x: "Saturday", y: 12 },
            ]}
            interpolation="monotoneX"
            name="birds"
          />
        </ChartStack>
      </Chart>
    </div>
  );
};
