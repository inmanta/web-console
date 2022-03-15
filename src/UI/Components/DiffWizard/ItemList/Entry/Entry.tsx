import React from "react";
import { EntryInfo, TransformEntry } from "@/UI/Components/DiffWizard/types";
import { DefaultEntry } from "./DefaultEntry";
import { FileEntry } from "./FileEntry";

interface Props extends EntryInfo {
  transform?: TransformEntry;
}

export const Entry: React.FC<Props> = ({
  title,
  fromValue,
  toValue,
  transform,
}) => {
  if (transform === undefined) {
    return <DefaultEntry {...{ title, fromValue, toValue }} />;
  }

  const transformed = transform(title, fromValue, toValue);

  if (transformed === "Default") {
    return <DefaultEntry {...{ title, fromValue, toValue }} />;
  }

  return <FileEntry {...{ title, fromValue, toValue }} />;
};
