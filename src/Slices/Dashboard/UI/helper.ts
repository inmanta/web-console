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
      tempCharState = tempCharState.map((metric) => formatValues(metric));
    }
  } else {
    tempCharState = [
      metrics.name.includes("service_count")
        ? formatValues(metrics as Metric)
        : (metrics as Metric),
    ];
    max = (metrics as Metric).data
      .flatMap((value) => (value !== null ? value : 0))
      .sort((a, b) => a - b)[(metrics as Metric).data.flat().length - 1];
  }
  return [tempCharState, max];
};

const formatValues = (metrics: Metric) => {
  const newMetrics = metrics.data.map((data) => {
    if (data == null) {
      return null;
    }
    return Math.round(data);
  });
  return {
    ...metrics,
    data: newMetrics,
  };
};

/**
 * Replace null values between two numbers(no matter how many nulls they are in between,
 * as long as there are some boundaries) with interpolation on line between those two numbers.
 *
 * @param metrics
 * @returns metrics with interpolated values instead null values
 */
export const interpolateMetrics = (metrics: (number | null)[]) => {
  const newMetric: (number | null)[] = [];
  let nextNumber = 0;

  metrics.forEach((value, index) => {
    if (nextNumber === -1) {
      newMetric.push(null);
    }
    if (value === null && (index === 0 || index === metrics.length - 1)) {
      newMetric.push(null);
    } else if (value === null && newMetric[index - 1] === null) {
      newMetric.push(null);
    } else if (value === null && newMetric[index - 1] !== null) {
      if (metrics[index + 1] !== null) {
        newMetric.push(lerp(newMetric[index - 1], metrics[index + 1], 0.5));
      } else {
        nextNumber = metrics.slice(index).findIndex((value) => value !== null);
        if (nextNumber === -1) {
          newMetric.push(null);
        } else {
          newMetric.push(
            lerp(newMetric[index - 1], metrics[index + 1], 1 / nextNumber)
          );
        }
      }
    } else {
      newMetric.push(value);
    }
  });

  return newMetric;
};

const lerp = (a, b, amount) => (1 - amount) * a + amount * b;
