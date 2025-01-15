import React, { useContext } from "react";
import { ChartDonut, ChartLegend } from "@patternfly/react-charts";
import {
  t_global_icon_color_status_danger_default,
  t_global_icon_color_nonstatus_on_blue_default,
  t_global_icon_color_status_success_default,
  t_global_icon_color_status_warning_default,
  t_global_icon_color_severity_undefined_default,
} from "@patternfly/react-tokens";
import { InstancesByLabel } from "@/Core";
import { ServiceInventoryContext } from "@/Slices/ServiceInventory/UI/ServiceInventory";
import { words } from "@/UI/words";

/**
 * @interface Props
 * @desc The props for the SummaryChart component.
 * @property {InstancesByLabel} by_label - The instances grouped by label.
 * @property {string} total - The total number of instances.
 */
interface Props {
  by_label: InstancesByLabel;
  total: string;
}

/**
 * @component SummaryChart
 * @desc A donut chart component with a legend that displays the instances grouped by label.
 * @param {Props} props - The component props.
 * @returns {JSX.Element} - The rendered SummaryChart component.
 */
export const SummaryChart: React.FC<Props> = ({ by_label, total }) => {
  const { labelFiltering } = useContext(ServiceInventoryContext);
  const chartData = getChartData(by_label);

  const legendData = chartData
    .map(({ x, y, color }) => ({
      name: `${x}: ${y}`,
      symbol: { fill: color },
    }))
    .filter(({ name }) => {
      let label = name.split(":")[0];

      label = label === "no label" ? "no_label" : label;

      return labelFiltering[label] && labelFiltering[label].length > 0;
    });
  const colorScale = chartData.map((dataPoint) => dataPoint.color);

  return (
    <ChartDonut
      ariaTitle={words("catalog.summary.title")}
      constrainToVisibleArea={true}
      data={chartData}
      legendComponent={
        <ChartLegend
          name={"legend"}
          data={legendData}
          events={[
            {
              target: "labels",
              eventHandlers: {
                onClick: () => {
                  return [
                    {
                      target: "labels",
                      mutation: (props) => {
                        let label = props.datum.name.split(":")[0];

                        label = label === "no label" ? "no_label" : label;
                        labelFiltering.onClick(labelFiltering[label]);
                      },
                    },
                  ];
                },
                onMouseEnter: () => {
                  return [
                    {
                      target: "labels",
                      mutation: () => ({
                        style: { cursor: "pointer", fontWeight: 700 },
                      }),
                    },
                  ];
                },
                onMouseLeave: () => {
                  return [
                    {
                      target: "labels",
                      mutation: () => ({
                        style: { fontWeight: 500 },
                      }),
                    },
                  ];
                },
              },
            },
          ]}
        />
      }
      labels={({ datum }) => `${datum.x}: ${datum.y}`}
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
      title={total}
      width={350}
      events={[
        {
          target: "data",
          eventHandlers: {
            onClick: () => {
              return [
                {
                  target: "data",
                  mutation: (props) => {
                    let label = props.datum.x;

                    label = label === "no label" ? "no_label" : label;
                    labelFiltering.onClick(labelFiltering[label]);
                  },
                },
              ];
            },
            onMouseEnter: () => {
              return [
                {
                  target: "data",
                  mutation: (props) => {
                    let label = props.datum.x;

                    label = label === "no label" ? "no_label" : label;

                    return {
                      style: {
                        ...props.style,
                        cursor:
                          labelFiltering[label] &&
                          labelFiltering[label].length > 0
                            ? "pointer"
                            : "default",
                      },
                    };
                  },
                },
              ];
            },
          },
        },
      ]}
    />
  );
};

const colorsForChart = {
  danger: t_global_icon_color_status_danger_default,
  warning: t_global_icon_color_status_warning_default,
  success: t_global_icon_color_status_success_default,
  info: t_global_icon_color_nonstatus_on_blue_default,
  no_label: t_global_icon_color_severity_undefined_default,
};

const orderedLabels = ["danger", "warning", "success", "info", "no_label"];

/**
 * @interface ChartData
 * @desc The data structure for each data point in the chart.
 * @property {string} x - The label for the data point.
 * @property {number} y - The value of the data point.
 * @property {string} color - The color of the data point.
 */
interface ChartData {
  x: string;
  y: number;
  color: string;
}

/**
 * @function getChartData
 * @desc Converts the instances grouped by label into chart data.
 * @param {InstancesByLabel} by_label - The instances grouped by label.
 * @returns {ChartData[]} - The chart data.
 */
function getChartData(by_label: InstancesByLabel): ChartData[] {
  return orderedLabels.map((label) => ({
    x: label === "no_label" ? words("catalog.summary.noLabel") : label,
    y: by_label[label],
    color: colorsForChart[label].value,
  }));
}
