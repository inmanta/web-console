import React, { useContext, useState } from "react";
import { AlertVariant } from "@patternfly/react-core";
import { useTriggerCompile } from "@/Data/Queries/Slices/Compilation/TriggerCompile";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../ToastAlert";
import { CompileWidget } from "./CompileWidget";

interface Props {
  afterTrigger?(): void;
  isToastVisible?: boolean;
}

export const Provider: React.FC<Props> = ({ afterTrigger, isToastVisible = false }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const [toastMessage, setToastMessage] = useState("");
  const isServerCompileEnabled = environmentHandler.useIsServerCompileEnabled();
  const env = environmentHandler.useId();

  const { mutate } = useTriggerCompile({
    onMutate: ({ update }) => {
      if (isToastVisible) {
        setToastMessage(words("common.compileWidget.toast")(update));
        setTimeout(() => {
          setToastMessage("");
        }, 2000);
      }
    },
    onSuccess: () => {
      afterTrigger && afterTrigger();
    },
  });

  const onRecompile = (update: boolean) => () => {
    mutate({ env, update });
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
