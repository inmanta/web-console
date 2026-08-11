import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartVoronoiContainer,
} from "@patternfly/react-charts/victory";
import { CustomDatePresenter } from "@/UI/Utils";

const datePresenter = new CustomDatePresenter();

const HEIGHT = 160;

interface Props {
  data: number[];
  timestamps: string[];
  max: number;
  color: string;
  formatValue: (value: number) => string;
  xStartLabel: string;
  xEndLabel: string;
  ariaLabel: string;
}

interface Datum {
  x: number;
  y: number;
  timestamp: string | undefined;
}

/**
 * 7-day trend line for the Orchestration Engine card, built on the same PatternFly/Victory
 * charting library (`@patternfly/react-charts`) as the V1 Dashboard's LineChart, rather than a
 * hand-rolled SVG - `ChartVoronoiContainer` gives hovering anywhere over the chart a tooltip that
 * snaps to the nearest datapoint for free. Only the axis extremes are labelled (max/0 on the y
 * axis, the range's start/end on the x axis) to match this card's compact space, unlike the V1
 * Dashboard's fully-ticked, legended charts.
 */
export const TrendChart: React.FC<Props> = ({
  data,
  timestamps,
  max,
  color,
  formatValue,
  xStartLabel,
  xEndLabel,
  ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = (): void => {
      if (containerRef.current) {
        setWidth(containerRef.current.getBoundingClientRect().width);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const domainMax = max === 0 ? 1 : max;
  // The chart's plotted range extends 10% past the real max so a peak at the max value has
  // headroom above it instead of touching the top edge - the y-axis tick still labels the real
  // max (formatValue(max)), only the domain the line is drawn against is taller.
  const yAxisDomainMax = domainMax * 1.1;
  const lastIndex = Math.max(data.length - 1, 0);
  const chartData: Datum[] = data.map((value, index) => ({
    x: index,
    y: value,
    timestamp: timestamps[index],
  }));

  return (
    <div ref={containerRef}>
      {width > 0 && (
        <Chart
          ariaDesc={ariaLabel}
          height={HEIGHT}
          width={width}
          domain={{ x: [0, lastIndex], y: [0, yAxisDomainMax] }}
          domainPadding={{ x: 10 }}
          padding={{ top: 10, bottom: 30, left: 60, right: 10 }}
          containerComponent={
            <ChartVoronoiContainer
              constrainToVisibleArea
              voronoiDimension="x"
              labels={({ datum }: { datum: Datum }) =>
                `${datum.timestamp ? datePresenter.getFull(datum.timestamp) : ""}\n${formatValue(datum.y)}`
              }
            />
          }
        >
          <ChartAxis
            tickValues={[0, lastIndex]}
            tickFormat={(tick: number) => (tick === 0 ? xStartLabel : xEndLabel)}
            style={{
              axis: { stroke: "var(--pf-t--global--border--color--default)" },
              tickLabels: { fill: "var(--pf-t--global--text--color--subtle)" },
            }}
          />
          <ChartAxis
            dependentAxis
            tickValues={[0, domainMax]}
            tickFormat={formatValue}
            style={{
              axis: { stroke: "transparent" },
              grid: { stroke: "transparent" },
              tickLabels: { fill: "var(--pf-t--global--text--color--subtle)" },
            }}
          />
          <ChartArea
            data={chartData}
            interpolation="monotoneX"
            style={{ data: { stroke: color, fill: color, fillOpacity: 0.15, strokeWidth: 2 } }}
          />
        </Chart>
      )}
    </div>
  );
};
