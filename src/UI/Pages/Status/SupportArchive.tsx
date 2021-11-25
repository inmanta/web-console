import React, { useContext, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Button,
} from "@patternfly/react-core";
import { Either } from "@/Core";
import { ArchiveHelper } from "@/Data";
import { DependencyContext } from "@/UI/Dependency";

type Phase = "Default" | "Downloading" | "Generating";

export const SupportArchive: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const [phase, setPhase] = useState<Phase>("Default");
  const [error, setError] = useState<null | string>(null);
  const trigger = commandResolver.getTrigger<"GetSupportArchive">({
    kind: "GetSupportArchive",
  });
  const archiveHelper = new ArchiveHelper();

  const onClick = async () => {
    setPhase("Downloading");
    setError(null);
    const result = await trigger();
    if (Either.isLeft(result)) {
      setPhase("Default");
      setError(result.value);
    } else {
      setPhase("Generating");
      const blob = await archiveHelper.generateBlob(result.value);
      archiveHelper.triggerDownload(blob);
      setPhase("Default");
    }
  };

  return (
    <>
      <Button
        spinnerAriaValueText={phaseLabelRecord[phase]}
        isLoading={phase !== "Default"}
        variant="primary"
        onClick={onClick}
        isDisabled={phase !== "Default"}
      >
        {phaseLabelRecord[phase]}
      </Button>
      {error && (
        <AlertGroup isToast isLiveRegion>
          <Alert
            variant="danger"
            title="Something went wrong with downloading the support archive"
            actionClose={
              <AlertActionCloseButton onClose={() => setError(null)} />
            }
          >
            {error}
          </Alert>
        </AlertGroup>
      )}
    </>
  );
};

const phaseLabelRecord: Record<Phase, string> = {
  Default: "Download support archive",
  Downloading: "Fetching support data",
  Generating: "Generating support archive",
};
