import { words } from "@/UI";
import { Metric, MetricName, StackedMetric } from "../Core/Domain";
import { colorTheme } from "./themes";

export const formatLegendData = (metrics, isStacked) => {
  if (isStacked) {
    const [formatLegendData] = formatMetricsToStacked(metrics, isStacked);
    return (formatLegendData as Metric[]).map(({ name }) => {
      return {
        childName: name,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        symbol: {
          fill:
            colorTheme[name] === undefined
              ? colorTheme.default
              : colorTheme[name],
        },
      };
    });
  } else {
    return [
      {
        childName: metrics.name,
        name: words(`dashboard.${metrics.name as MetricName}.label.x`).split(
          "["
        )[0],
        symbol: {
          fill:
            colorTheme[metrics.name] === undefined
              ? colorTheme.default
              : colorTheme[metrics.name],
        },
      },
    ];
  }
};
export const formatMetricsToStacked = (
  metrics: StackedMetric | Metric,
  isStacked: boolean
) => {
  let tempCharState: Metric[] = [];
  let max = 0;
  if (isStacked) {
    const { data } = metrics as StackedMetric;
    const base = data.find((object) => object !== null);
    if (base !== undefined && base !== null) {
      const keys = Object.keys(base);
      keys.map((key) => {
        tempCharState.push({
          name: key,
          data: [],
        });
      });
      data.map((object) => {
        let tempMax = 0;
        keys.forEach((key, index) => {
          tempMax += object === null ? 0 : object[key];
          tempCharState[index].data.push(object === null ? null : object[key]);
        });
        if (max < tempMax) {
          max = tempMax;
        }
      });
    }
  } else {
    tempCharState = [metrics as Metric];
    max = (metrics as Metric).data
      .flatMap((value) => (value !== null ? value : 0))
      .sort((a, b) => a - b)[(metrics as Metric).data.flat().length - 1];
  }
  return [tempCharState, max];
};
