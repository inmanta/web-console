import React from "react";
import { EnvironmentSettings } from "@/Core";
import { BooleanInput } from "./BooleanInput";
import { DictInputWithRow } from "./DictInput";
import { EnumInput } from "./EnumInput";
import { IntInput } from "./IntInput";
import { PositiveFloatInput } from "./PositiveFloatInput";
import { Row } from "./Row";
import { StringInput } from "./StringInput";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const InputRow: React.FC<Props> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return (
        <Row info={info}>
          <BooleanInput info={info} />
        </Row>
      );
    case "int":
      return (
        <Row info={info}>
          <IntInput info={info} />
        </Row>
      );
    case "positive_float":
      return (
        <Row info={info}>
          <PositiveFloatInput info={info} />
        </Row>
      );
    case "enum":
      return (
        <Row info={info}>
          <EnumInput info={info} />
        </Row>
      );
    case "dict":
      return <DictInputWithRow info={info} />;
    case "str":
      return (
        <Row info={info}>
          <StringInput info={info} />
        </Row>
      );
  }
};
