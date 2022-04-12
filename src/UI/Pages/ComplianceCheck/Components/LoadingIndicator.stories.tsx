import React from "react";
import { LoadingIndicator } from "./LoadingIndicator";

export default {
  title: "LoadingIndicator",
  component: LoadingIndicator,
};

export const Default: React.FC = () => <LoadingIndicator progress="44/45" />;
