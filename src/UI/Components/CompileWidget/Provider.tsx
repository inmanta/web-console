import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CompileWidget } from "./CompileWidget";

interface Props {
  afterTrigger?(): void;
}

export const Provider: React.FC<Props> = ({ afterTrigger }) => {
  const { commandResolver, queryResolver, environmentModifier } =
    useContext(DependencyContext);
  const isServerCompileEnabled =
    environmentModifier.useIsServerCompileEnabled();

  const trigger = commandResolver.useGetTrigger<"TriggerCompile">({
    kind: "TriggerCompile",
  });
  const [data, refetch] = queryResolver.useContinuous<"GetCompilerStatus">({
    kind: "GetCompilerStatus",
  });

  const onRecompile = (update: boolean) => async () => {
    await trigger(update);
    document.dispatchEvent(new CustomEvent("CompileTrigger"));
    refetch();
    afterTrigger && afterTrigger();
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
