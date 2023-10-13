import React, { useContext, useState } from "react";
import { AlertVariant } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../ToastAlert";
import { CompileWidget } from "./CompileWidget";

interface Props {
  afterTrigger?(): void;
  isToastVisible?: boolean;
}

export const Provider: React.FC<Props> = ({
  afterTrigger,
  isToastVisible = false,
}) => {
  const { commandResolver, queryResolver, environmentModifier } =
    useContext(DependencyContext);
  const [toastMessage, setToastMessage] = useState("");
  const isServerCompileEnabled =
    environmentModifier.useIsServerCompileEnabled();
  const trigger = commandResolver.useGetTrigger<"TriggerCompile">({
    kind: "TriggerCompile",
  });
  const [, refetch] = queryResolver.useContinuous<"GetCompilerStatus">({
    kind: "GetCompilerStatus",
  });

  const onRecompile = (update: boolean) => async () => {
    if (isToastVisible) {
      setToastMessage(words("common.compileWidget.toast")(update));
      setTimeout(() => {
        setToastMessage("");
      }, 2000);
    }
    await trigger(update);
    document.dispatchEvent(new CustomEvent("CompileTrigger"));
    refetch();
    afterTrigger && afterTrigger();
  };

  return (
    <>
      {isToastVisible && (
        <ToastAlert
          data-testid="ToastAlert"
          type={AlertVariant.info}
          message={toastMessage}
          setMessage={setToastMessage}
          title={words("common.compileWidget.toastTitle")}
        />
      )}
      <CompileWidget
        onRecompile={onRecompile(false)}
        onUpdateAndRecompile={onRecompile(true)}
        isDisabled={!isServerCompileEnabled}
        hint={
          isServerCompileEnabled
            ? undefined
            : words("common.compileWidget.compilationDisabled.hint")
        }
      />
    </>
  );
};
