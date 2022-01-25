import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { CompileWidget } from "./CompileWidget";

export const Provider: React.FC = () => {
  const { commandResolver, queryResolver } = useContext(DependencyContext);

  const trigger = commandResolver.getTrigger<"TriggerCompile">({
    kind: "TriggerCompile",
  });

  const [compiling, refetch] = queryResolver.useContinuous<"GetCompilerStatus">(
    {
      kind: "GetCompilerStatus",
    }
  );

  const onRecompile = async () => {
    await trigger(false);
    refetch();
  };

  const onUpdateAndRecompile = async () => {
    await trigger(true);
    refetch();
  };

  return (
    <CompileWidget
      compiling={compiling}
      onRecompile={onRecompile}
      onUpdateAndRecompile={onUpdateAndRecompile}
    />
  );
};
