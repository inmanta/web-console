import React from "react";
import { ChartAxis, ChartAxisProps } from "@patternfly/react-charts";

interface CustomAxisProps extends ChartAxisProps {
  style: {
    ticks: {
      [key: string]: number;
    };
  };
}
/**
 * This Custom component was needed to avoid TypeScript issue as
 * ChartAxis props didn't recognize size property in styles,
 * which were use to define length of the ticks on axis
 */
export const CustomAxis = ({ ...props }: CustomAxisProps) => {
  return <ChartAxis {...props} />;
};
