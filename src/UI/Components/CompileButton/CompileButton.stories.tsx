import React from "react";
import { RemoteData } from "@/Core";
import { CompileButton } from "./CompileButton";

export default {
  title: "CompileButton",
  component: CompileButton,
};

export const Default = () => (
  <CompileButton
    compiling={RemoteData.success(false)}
    onRecompile={() => alert("Recompile")}
    onUpdateAndRecompile={() => alert("Update & Recompile")}
  />
);
