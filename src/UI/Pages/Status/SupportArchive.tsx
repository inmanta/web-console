import React, { useContext, useState } from "react";
import { Alert, AlertActionCloseButton, Button } from "@patternfly/react-core";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Either } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

class ArchiveHelper {
  /**
   * Generates a blob based on the provided string
   * @param value a base64 encoded string of zip archive
   */
  async generateBlob(value: string): Promise<Blob> {
    const zip = await JSZip.loadAsync(value, { base64: true });
    return await zip.generateAsync({ type: "blob" });
  }

  triggerDownload(blob: Blob): void {
    saveAs(blob, "support-archive.zip");
  }
}

const archiveHelper = new ArchiveHelper();

type Phase = "Default" | "Downloading" | "Generating";

export const SupportArchive: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const [phase, setPhase] = useState<Phase>("Default");
  const [error, setError] = useState<null | string>(null);
  const trigger = commandResolver.getTrigger<"GetSupportArchive">({
    kind: "GetSupportArchive",
  });

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
      <span>Support Archive: </span>
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
        <Alert
          variant="danger"
          isInline
          title="Something went wrong with downloading the support archive"
          actionClose={<AlertActionCloseButton onClose={close} />}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

const phaseLabelRecord: Record<Phase, string> = {
  Default: "Download",
  Downloading: "Fetching data",
  Generating: "Generating archive",
};
