import React from "react";
import { EnvironmentSettings } from "@/Core";
import { IntInput } from "./IntInput";
import { BooleanInput } from "./BooleanInput";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const Input: React.FC<Props> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return <BooleanInput info={info} />;
    case "int":
      return <IntInput info={info} />;
    case "enum":
      return <>enum</>;
    case "dict":
      return <>dict</>;
  }
};
