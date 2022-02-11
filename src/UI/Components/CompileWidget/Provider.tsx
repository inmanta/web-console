import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { CompileWidget } from "./CompileWidget";

export const Provider: React.FC = () => {
  const { commandResolver, queryResolver } = useContext(DependencyContext);

  const trigger = commandResolver.getTrigger<"TriggerCompile">({
    kind: "TriggerCompile",
  });
  const [data, refetch] = queryResolver.useContinuous<"GetCompilerStatus">({
    kind: "GetCompilerStatus",
  });

  const onRecompile = (update: boolean) => async () => {
    await trigger(update);
    refetch();
  };

  return (
    <CompileWidget
      data={data}
      onRecompile={onRecompile(false)}
      onUpdateAndRecompile={onRecompile(true)}
    />
  );
};
