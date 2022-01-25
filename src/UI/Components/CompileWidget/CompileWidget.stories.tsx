import React, { useState } from "react";
import { RemoteData } from "@/Core";
import { CompileWidget } from "./CompileWidget";

export default {
  title: "CompileWidget",
  component: CompileWidget,
};

export const Default = () => (
  <CompileWidget
    compiling={RemoteData.success(false)}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
  />
);

export const Disabled = () => (
  <CompileWidget
    compiling={RemoteData.success(true)}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
  />
);

export const Loading = () => (
  <CompileWidget
    compiling={RemoteData.loading()}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
  />
);

export const Scenario = () => {
  const [compiling, setCompiling] = useState<
    RemoteData.RemoteData<undefined, boolean>
  >(RemoteData.success(false));

  const onRecompile = () => {
    setCompiling(RemoteData.loading());
    setTimeout(() => setCompiling(RemoteData.success(false)), 2000);
  };
  return (
    <CompileWidget
      compiling={compiling}
      onRecompile={onRecompile}
      onUpdateAndRecompile={() => alert("Update & Recompile")}
    />
  );
};
