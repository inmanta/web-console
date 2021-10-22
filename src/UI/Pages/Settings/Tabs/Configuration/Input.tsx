import React from "react";
import { EnvironmentSettings } from "@/Core";
import { IntInput } from "./IntInput";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const Input: React.FC<Props> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return <>bool</>;
    case "int":
      return <IntInput info={info} />;
    case "enum":
      return <>enum</>;
    case "dict":
      return <>dict</>;
  }
};
