import React from "react";
import { Spacer } from "@/UI/Components";
import { DownloadButton } from "./DownloadButton";

export default {
  title: "DownloadButton",
  component: DownloadButton,
};

export const Default: React.FC = () => {
  return (
    <>
      <DownloadButton phase="Default" onClick={() => undefined} />
      <Spacer />
      <DownloadButton phase="Downloading" onClick={() => undefined} />
      <Spacer />
      <DownloadButton phase="Generating" onClick={() => undefined} />
    </>
  );
};
