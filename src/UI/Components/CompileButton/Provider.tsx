import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { CompileButton } from "./CompileButton";

export const Provider: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);

  const trigger = commandResolver.getTrigger<"TriggerCompile">({
    kind: "TriggerCompile",
  });

  return (
    <CompileButton
      compiling={{ kind: "Success", value: false }}
      onRecompile={() => trigger(false)}
      onUpdateAndRecompile={() => trigger(true)}
    />
  );
};
