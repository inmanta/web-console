import React from "react";
import { DownloadButton } from "./DownloadButton";

export default {
  title: "DownloadButton",
  component: DownloadButton,
};

export const Default: React.FC = () => {
  return (
    <>
      <DownloadButton phase="Default" onClick={() => undefined} />
      <DownloadButton phase="Downloading" onClick={() => undefined} />
      <DownloadButton phase="Generating" onClick={() => undefined} />
    </>
  );
};
