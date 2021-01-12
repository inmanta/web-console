import React from "react";
import { useParams } from "react-router-dom";
import { View } from "./View";

interface Params {
  id: string;
}

export const Provider: React.FC = () => {
  const { id } = useParams<Params>();
  return <View id={id} />;
};
