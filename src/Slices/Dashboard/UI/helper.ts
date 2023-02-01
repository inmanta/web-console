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
    //if there is no non-nullish value from previous iteration then push null as there is no number to interpolato to
    if (nextNumber === -1) {
      newMetric.push(null);
    }
    //if null value is on the start or end of metrics then there is no value to interpolate (from or to), then push null
    if (value === null && (index === 0 || index === metrics.length - 1)) {
      newMetric.push(null);
      //if null value is null and previous is also null, then push null
    } else if (value === null && newMetric[index - 1] === null) {
      newMetric.push(null);
      //if null and there is a value to interpolate from then look for next non-nullish value
    } else if (value === null && newMetric[index - 1] !== null) {
      nextNumber = metrics.slice(index).findIndex((value) => value !== null);
      //if no number is found then push null
      if (nextNumber === -1) {
        newMetric.push(null);
      } else {
        //if there is a number, then push interpolated value,
        newMetric.push(
          linearInterpolation(
            newMetric[index - 1], //previous non-nullish value
            metrics[index + nextNumber], // next non-nullish number,
            1 / (nextNumber + 1) //fraction of a distance from value before to nextNumber value
          )
        );
      }
    } else {
      newMetric.push(value);
    }
  });

  return newMetric;
};

const linearInterpolation = (a, b, amount) => (1 - amount) * a + amount * b;
