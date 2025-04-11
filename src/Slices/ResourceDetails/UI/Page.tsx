import React from "react";
import { useRouteParams } from "@/UI/Routing";
import { View } from "./View";

/**
 * The Page component.
 *
 * This component is responsible of displaying the resource details.
 *
 * @returns {React.FC} A React Component displaying the resource details
 */
export const Page: React.FC = () => {
  const { resourceId } = useRouteParams<"ResourceDetails">();

  return <View id={resourceId} />;
};
