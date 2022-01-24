import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { CompileWidget } from "./CompileWidget";

export const Provider: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);

  const trigger = commandResolver.getTrigger<"TriggerCompile">({
    kind: "TriggerCompile",
  });

  return (
    <CompileWidget
      compiling={{ kind: "Success", value: false }}
      onRecompile={() => trigger(false)}
      onUpdateAndRecompile={() => trigger(true)}
    />
  );
};
