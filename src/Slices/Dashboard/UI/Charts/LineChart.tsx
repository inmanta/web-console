import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartLegendTooltip,
  createContainer,
  ChartStack,
  ChartArea,
  ChartLabel,
  ChartLabelProps,
  ChartScatter,
  ChartLegend,
  ChartAxisProps,
} from "@patternfly/react-charts";
import styled, { css } from "styled-components";
import { LineChartProps } from "../../Core/Domain";
import { interpolateMetrics } from "../helper";
import { colorTheme } from "../themes";
interface CustomAxisProps extends ChartAxisProps {
  style: {
    ticks: {
      [key: string]: number;
    };
  };
}
const CustomAxis = ({ ...props }: CustomAxisProps) => {
  return <ChartAxis {...props} />;
};
export const LineChart: React.FC<LineChartProps> = ({
  title,
  label,
  legendData,
  timestamps,
  metrics,
  max,
  isStacked = false,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  // Note: Container order is important
  const CursorVoronoiContainer = createContainer("voronoi", "voronoi");
  const formatValueForChart = (value: null | number) => {
    if (value === null) {
      return null;
    }
    return value % 1 === 0 ? value : Math.round(value * 1000) / 1000;
  };
  const chooseWhichLabelToUse = (datum) => {
    if (
      (isStacked && !datum.childName.includes("scatter-")) ||
      (!isStacked && datum.childName.includes("scatter-"))
    ) {
      return `${datum.y !== null ? datum.y : "no data"}`;
    } else {
      return null;
    }
  };
  useEffect(() => {
    function handleResize() {
      // Set window width to state if width from ref is available
      if (
        ref.current?.parentElement?.getBoundingClientRect().width !== undefined
      ) {
        setWidth(ref.current?.parentElement?.getBoundingClientRect().width);
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div ref={ref}>
      <Chart
        ariaDesc={title}
        containerComponent={
          <CursorVoronoiContainer
            labels={({ datum }) => chooseWhichLabelToUse(datum)}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
                title={(datum) => new Date(datum.x).toLocaleString()}
                flyoutWidth={250}
              />
            }
            voronoiDimension="x"
            voronoiPadding={10}
          />
        }
        legendData={isStacked ? legendData : undefined}
        legendPosition="bottom"
        legendComponent={
          <ChartLegend
            borderPadding={{ top: 25 }}
            style={{ labels: { fontSize: 16 } }}
            orientation="horizontal"
            responsive={true}
          />
        }
        legendAllowWrap={true}
        maxDomain={{ y: max === 0 ? 5 : max * 1.1 }}
        minDomain={{ y: 0 }}
        name={`chart-${title}`}
        padding={{
          bottom: isStacked ? 125 : 60, // Adjusted to accommodate legend
          left: 100,
          right: 45,
          top: 20,
        }}
        height={isStacked ? 350 : 300}
        width={width}
      >
        <CustomAxis
          tickLabelComponent={
            <StyledChartLabel
              dx={({ index }) => (index == timestamps.length - 1 ? -20 : 0)}
              lineHeight={1.4}
            />
          }
          tickFormat={(x) => {
            const date = new Date(x).toLocaleString().split(",");
            return date[0] + "\n" + date[1];
          }}
          style={{
            ticks: { size: 10 },
          }}
        />
        <ChartAxis
          dependentAxis
          showGrid
          fixLabelOverlap
          axisLabelComponent={<ChartLabel dy={-30} />}
          label={label}
          offsetX={100}
          style={{
            grid: { stroke: "#E5E4E2" },
          }}
        />
        {isStacked ? (
          <ChartStack>
            {metrics.reverse().map(({ name, data }, index) => (
              <ChartArea
                data={data.map((value, index) => {
                  return {
                    x: timestamps[index] + "Z",
                    y: formatValueForChart(value),
                  };
                })}
                name={name}
                key={name + index}
                style={{
                  data: {
                    stroke:
                      colorTheme[name] === undefined
                        ? colorTheme.default
                        : colorTheme[name],
                    fill:
                      colorTheme[name] === undefined
                        ? colorTheme.default
                        : colorTheme[name],
                  },
                }}
              />
            ))}
          </ChartStack>
        ) : (
          <ChartGroup>
            {metrics.map(({ name, data }, index) => (
              <ChartLine
                data={interpolateMetrics(data).map((value, index) => {
                  return {
                    x: timestamps[index] + "Z",
                    y: formatValueForChart(value),
                  };
                })}
                name={name}
                key={name + index}
                style={{
                  data: {
                    stroke:
                      colorTheme[name] === undefined
                        ? colorTheme.default
                        : colorTheme[name],
                  },
                }}
              />
            ))}
          </ChartGroup>
        )}
        {!isStacked && (
          <ChartGroup>
            {metrics.map(({ name, data }, metricIndex) => (
              <ChartScatter
                data={data.map((value, index) => {
                  return {
                    x: timestamps[index] + "Z",
                    y: formatValueForChart(value),
                  };
                })}
                name={"scatter-" + name}
                key={"scatter-" + name + metricIndex}
                style={{
                  data: {
                    fill:
                      colorTheme[name] === undefined
                        ? colorTheme.default
                        : colorTheme[name],
                  },
                }}
              />
            ))}
          </ChartGroup>
        )}
      </Chart>
    </div>
  );
};

const StyledChartLabel = styled(ChartLabel)<ChartLabelProps>`
  ${({ index }) => {
    return css`
      tspan {
        font-size: 16px !important;
        ${(index as number) % 2 === 1 ? "visibility: hidden !important" : ""}
      }
    `;
  }}
`;
