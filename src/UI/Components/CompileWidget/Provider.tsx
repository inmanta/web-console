import React, { useContext, useState } from "react";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { CompileWidget } from "./CompileWidget";

export const Provider: React.FC = () => {
  const [isFakeCompiling, setFakeCompiling] = useState(false);
  const { commandResolver, queryResolver } = useContext(DependencyContext);

  const trigger = commandResolver.getTrigger<"TriggerCompile">({
    kind: "TriggerCompile",
  });

  const [data, refetch] = queryResolver.useContinuous<"GetCompilerStatus">({
    kind: "GetCompilerStatus",
  });

  const onRecompile = (update: boolean) => async () => {
    setFakeCompiling(true);
    await trigger(update);
    setTimeout(() => setFakeCompiling(false), 1000);
    refetch();
  };

  return (
    <CompileWidget
      data={isFakeCompiling ? RemoteData.success(true) : data}
      onRecompile={onRecompile(false)}
      onUpdateAndRecompile={onRecompile(true)}
    />
  );
};
