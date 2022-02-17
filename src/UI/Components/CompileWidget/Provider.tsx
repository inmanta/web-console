import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CompileWidget } from "./CompileWidget";

export const Provider: React.FC = () => {
  const { commandResolver, queryResolver, environmentModifier } =
    useContext(DependencyContext);
  const isServerCompileEnabled =
    environmentModifier.useIsServerCompileEnabled();

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
      isDisabled={!isServerCompileEnabled}
      hint={
        isServerCompileEnabled
          ? undefined
          : words("common.compileWidget.compilationDisabled.hint")
      }
    />
  );
};
