import React from "react";
import { useRouteParams } from "@/UI";
import { MarkdownPreviewer } from "./MarkdownPreviewer";

/**
 * The Page Component
 *
 * @note For testing purposes, the useRouteParams logic has been separated.
 * The useRouteParam has its own coverage.
 *
 * @returns {React.FC} A React Component to wrap the MarkdownPreviewer.
 */
export const Page: React.FC = () => {
  const { service, instance, instanceId } = useRouteParams<"MarkdownPreviewer">();

  return <MarkdownPreviewer service={service} instance={instance} instanceId={instanceId} />;
};
