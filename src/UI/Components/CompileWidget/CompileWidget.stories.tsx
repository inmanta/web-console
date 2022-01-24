import React from "react";
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
