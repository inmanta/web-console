import React, { useContext, useState } from "react";
import { Alert, AlertGroup } from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { GetEnvironmentPreviewKey, useTriggerCompile } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CompileWidget } from "./CompileWidget";

interface Props {
  afterTrigger?(): void;
}

export const Provider: React.FC<Props> = ({ afterTrigger }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isServerCompileEnabled = environmentHandler.useIsServerCompileEnabled();
  const env = environmentHandler.useId();
  const client = useQueryClient();

  const { mutate } = useTriggerCompile({
    onMutate: ({ update, reinstall }) => {
      setToastMessage(words("common.compileWidget.toast")(update, reinstall));
      setTimeout(() => {
        setToastMessage("");
      }, 2000);
    },
    onSuccess: () => {
      client.refetchQueries({ queryKey: GetEnvironmentPreviewKey.root() });
      afterTrigger && afterTrigger();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const onRecompile = (update: boolean, reinstall: boolean) => () => {
    mutate({ env, update, reinstall });
  };

  return (
    <>
      <AlertGroup aria-live="polite" isToast isLiveRegion>
        {toastMessage && (
          <Alert
            variant="info"
            title={words("info.title")}
            key={`info-${uuidv4()}`}
            timeout={5000}
            aria-label="info-message"
            data-testid="info-message"
          >
            {toastMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert
            variant="danger"
            title={words("error.title")}
            key={`error-${uuidv4()}`}
            timeout={5000}
            aria-label="error-message"
            data-testid="error-message"
          >
            {errorMessage}
          </Alert>
        )}
      </AlertGroup>
      <CompileWidget
        onRecompile={onRecompile(false, false)}
        onUpdateAndRecompile={onRecompile(true, false)}
        onCleanupAndRecompile={onRecompile(false, true)}
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
