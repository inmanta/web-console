import React from "react";
import { Maybe } from "@/Core";
import { Spacer } from "@/UI/Components";
import { CompareSelectionLabel } from "./CompareSelectionLabel";

export default {
  title: "DesiredState/CompareSelectionLabel",
  component: CompareSelectionLabel,
};

export const Default = () => (
  <>
    <CompareSelectionLabel
      onDelete={() => alert("onDelete")}
      selection={Maybe.none()}
    />
    <Spacer />
    <CompareSelectionLabel
      onDelete={() => alert("onDelete")}
      selection={Maybe.some(123)}
    />
    <Spacer />
    <CompareSelectionLabel
      onDelete={() => alert("onDelete")}
      selection={Maybe.some(987654321888888)}
    />
  </>
);
