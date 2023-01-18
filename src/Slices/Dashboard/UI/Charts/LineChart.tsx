import React from "react";
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartThemeColor,
  ChartLegendTooltip,
  createContainer,
  ChartStack,
  ChartArea,
  ChartLabel,
  ChartLabelProps,
  ChartScatter,
} from "@patternfly/react-charts";
import styled, { css } from "styled-components";
import { LineChartProps } from "../../Core/interfaces";
import { colorTheme } from "../themes";

export const LineChart: React.FC<LineChartProps> = ({
  title,
  description,
  label,
  legendData,
  timestamps,
  metrics,
  minMax,
  isStacked = false,
}) => {
  // Note: Container order is important
  const CursorVoronoiContainer = createContainer("voronoi", "cursor");
  const min = Math.floor(minMax[0]);
  const max = Math.ceil(minMax[minMax.length - 1]);
  const convertScatterToStacked: (
    stack: number,
    group: number,
    value: number | null
  ) => number | null = (stack, group, value) => {
    if (value == null) return null;
    let sumOfStackedValues = 0;
    for (let iterator = 0; iterator < stack; iterator++) {
      sumOfStackedValues += metrics[iterator].data[group];
    }
    return sumOfStackedValues + value;
  };
  return (
    <Chart
      ariaDesc={title}
      ariaTitle={description}
      containerComponent={
        <CursorVoronoiContainer
          cursorDimension="x"
          labels={({ datum }) => `${datum.y !== null ? datum.y : "no data"}`}
          labelComponent={
            <ChartLegendTooltip
              legendData={legendData}
              title={(datum) => new Date(datum.x).toUTCString().slice(5, 25)}
              flyoutWidth={200}
            />
          }
          mouseFollowTooltips
          voronoiDimension="x"
          voronoiPadding={10}
        />
      }
      legendData={isStacked ? legendData : undefined}
      legendPosition="bottom"
      maxDomain={{ y: max * 1.1 }}
      minDomain={{ y: isStacked || min === 0 ? 0 : min * 0.9 }}
      name={`chart-${title}`}
      padding={{
        bottom: isStacked ? 70 : 50, // Adjusted to accommodate legend
        left: 60,
        right: 25,
        top: 20,
      }}
      themeColor={ChartThemeColor.multiUnordered}
      height={300}
      width={1000}
    >
      <ChartAxis
        tickLabelComponent={
          <StyledChartLabel
            tickLength={timestamps.length}
            dx={({ index }) => (index == timestamps.length - 1 ? -20 : 0)}
          />
        }
        tickFormat={(x) => {
          const date = new Date(x).toUTCString();
          return date.slice(5, 16) + "\n" + date.slice(17, 25);
        }}
      />
      <ChartAxis dependentAxis showGrid label={label} />
      {isStacked ? (
        <ChartStack>
          {metrics.map(({ name, data }, index) => (
            <ChartArea
              data={data.map((value, index) => {
                return { x: timestamps[index], y: value };
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
              data={data.map((value, index) => {
                return {
                  x: timestamps[index],
                  y: value % 1 === 0 ? value : Math.round(value * 1000) / 1000,
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
      <ChartGroup>
        {metrics.map(({ name, data }, metricIndex) => (
          <ChartScatter
            data={data.map((value, index) => {
              return {
                x: timestamps[index],
                y:
                  value === null
                    ? null
                    : value % 1 === 0
                    ? convertScatterToStacked(metricIndex, index, value)
                    : Math.round(
                        (convertScatterToStacked(
                          metricIndex,
                          index,
                          value
                        ) as number) * 1000
                      ) / 1000,
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
    </Chart>
  );
};

interface StyledChartLabel extends ChartLabelProps {
  tickLength: number;
}
const StyledChartLabel = styled(ChartLabel)<StyledChartLabel>`
  ${({ index, tickLength }) => {
    return css`
      ${index !== 0 && index !== tickLength - 1
        ? "visibility: hidden !important"
        : ""}
    `;
  }}
`;
