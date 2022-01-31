import React from "react";
import { DiffExample, DiffExampleSide } from "./DiffExample";

export default {
  title: "DiffExample",
  component: DiffExample,
};

export const Default: React.FC = () => {
  return <DiffExample />;
};

export const Side: React.FC = () => {
  return <DiffExampleSide />;
};
