import React, { useState } from "react";
import { RemoteData } from "@/Core";
import { Spacer } from "@/UI/Components/Spacer";
import { CompileWidget } from "./CompileWidget";

export default {
  title: "CompileWidget",
  component: CompileWidget,
};

export const Default = () => (
  <>
    <p>NotCompiling:</p>
    <NotCompiling />
    <Spacer />
    <p>Compiling:</p>
    <Compiling />
    <Spacer />
    <p>Loading:</p>
    <Loading />
    <Spacer />
    <p>Scenario:</p>
    <Scenario />
    <Spacer />
    <p>Disabled:</p>
    <Disabled />
    <Spacer />
    <p>Hinted:</p>
    <Hinted />
  </>
);

const Hinted = () => (
  <CompileWidget
    data={RemoteData.success(false)}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
    isDisabled
    hint="Some hint giving more information"
  />
);

const Disabled = () => (
  <CompileWidget
    data={RemoteData.success(false)}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
    isDisabled
  />
);

const NotCompiling = () => (
  <CompileWidget
    data={RemoteData.success(false)}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
  />
);

const Compiling = () => (
  <CompileWidget
    data={RemoteData.success(true)}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
  />
);

const Loading = () => (
  <CompileWidget
    data={RemoteData.loading()}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
  />
);

const Scenario = () => {
  const [data, setData] = useState<RemoteData.RemoteData<undefined, boolean>>(
    RemoteData.success(false)
  );

  const onRecompile = () => {
    setData(RemoteData.loading());
    setTimeout(() => setData(RemoteData.success(false)), 2000);
  };

  return (
    <CompileWidget
      data={data}
      onRecompile={onRecompile}
      onUpdateAndRecompile={() => alert("Update & Recompile")}
    />
  );
};
