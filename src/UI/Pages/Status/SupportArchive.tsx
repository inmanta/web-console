import React, { useContext, useState } from "react";
import { Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";

export const SupportArchive: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const [busy, setBusy] = useState(false);

  const trigger = commandResolver.getTrigger<"GetSupportArchive">({
    kind: "GetSupportArchive",
  });

  const onClick = async () => {
    setBusy(true);
    const result = await trigger();
    setBusy(false);
    console.log({ result });
  };

  return (
    <>
      <span>Support Archive: </span>
      <Button variant="primary" onClick={onClick} isDisabled={busy}>
        Download <DownloadIcon />
      </Button>
    </>
  );
};
