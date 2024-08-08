import React from "react";
import { useRouteParams } from "@/UI/Routing";
import { View } from "./View";

export const Page: React.FC = () => {
  const { resourceId } = useRouteParams<"ResourceDetails">();
  return <View id={resourceId} />;
};
