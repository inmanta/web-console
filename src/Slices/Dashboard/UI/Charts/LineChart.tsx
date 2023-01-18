import React, { useEffect, useRef, useState } from "react";
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
  ChartLegend,
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
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

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
        ariaTitle={description}
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={({ datum }) =>
              !datum.childName.includes("scatter-")
                ? `${datum.y !== null ? datum.y : "no data"}`
                : null
            }
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData.reverse()}
                title={(datum) => new Date(datum.x).toUTCString().slice(5, 25)}
                flyoutWidth={190}
              />
            }
            mouseFollowTooltips
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
          />
        }
        maxDomain={{ y: max * 1.1 }}
        minDomain={{ y: isStacked || min === 0 ? 0 : min * 0.9 }}
        name={`chart-${title}`}
        padding={{
          bottom: isStacked ? 85 : 60, // Adjusted to accommodate legend
          left: 60,
          right: 25,
          top: 20,
        }}
        themeColor={ChartThemeColor.multiUnordered}
        height={300}
        width={width}
      >
        <ChartAxis
          tickLabelComponent={
            <StyledChartLabel
              dx={({ index }) => (index == timestamps.length - 1 ? -20 : 0)}
              lineHeight={1.4}
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
            {metrics.reverse().map(({ name, data }, index) => (
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
                    y:
                      value % 1 === 0 ? value : Math.round(value * 1000) / 1000,
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
