import React, { useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GetEnvironmentPreviewKey, useTriggerCompile } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";
import { CompileWidget } from "./CompileWidget";

interface Props {
  afterTrigger?(): void;
}

export const Provider: React.FC<Props> = ({ afterTrigger }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isServerCompileEnabled = environmentHandler.useIsServerCompileEnabled();
  const env = environmentHandler.useId();
  const client = useQueryClient();
  const { notifyInfo, notifyError } = useAppAlert();

  const { mutate } = useTriggerCompile({
    onMutate: ({ update, reinstall }) => {
      notifyInfo({
        title: words("info.title"),
        message: words("common.compileWidget.toast")(update, reinstall),
        testId: "info-message",
      });
    },
    onSuccess: () => {
      client.refetchQueries({ queryKey: GetEnvironmentPreviewKey.root() });
      afterTrigger && afterTrigger();
    },
    onError: (error) => {
      notifyError({
        title: words("error.title"),
        message: error.message,
        testId: "error-message",
      });
    },
  });

  const onRecompile = (update: boolean, reinstall: boolean) => () => {
    mutate({ env, update, reinstall });
  };

  return (
    <CompileWidget
      onRecompile={onRecompile(false, false)}
      onUpdateAndRecompile={onRecompile(true, false)}
      onCleanupAndRecompile={onRecompile(false, true)}
      isDisabled={!isServerCompileEnabled}
      hint={
        isServerCompileEnabled ? undefined : words("common.compileWidget.compilationDisabled.hint")
      }
    />
  );
};
