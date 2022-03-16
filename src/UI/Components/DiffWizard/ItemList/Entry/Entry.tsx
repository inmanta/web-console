import React from "react";
import { Classification, EntryInfo } from "@/UI/Components/DiffWizard/types";
import { DefaultEntry } from "./DefaultEntry";
import { FileEntry } from "./FileEntry";

type Classify = (title: string, from: string, to: string) => Classification;

interface Props extends EntryInfo {
  classify?: Classify;
}

export const Entry: React.FC<Props> = ({
  title,
  fromValue,
  toValue,
  classify,
}) => {
  if (classify === undefined) {
    return <DefaultEntry {...{ title, fromValue, toValue }} />;
  }

  const classification = classify(title, fromValue, toValue);

  if (classification === "Default") {
    return <DefaultEntry {...{ title, fromValue, toValue }} />;
  }

  return <FileEntry {...{ title, fromValue, toValue }} />;
};
