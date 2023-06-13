import React, { useEffect, useRef, useState } from "react";
import "@inmanta/rappid/rappid.css";
import { Modal } from "@patternfly/react-core";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import diagramInit from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import { DictDialogData } from "./interfaces";

const Canvas = ({
  service,
  instance,
}: {
  service: ServiceModel;
  instance?: ServiceInstanceModel;
}) => {
  const canvas = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stringifiedDicts, setStringifiedDicts] = useState<DictDialogData[]>(
    []
  );

  const openDictsModal = (event: Event) => {
    const customEvent = event as CustomEvent;
    setStringifiedDicts(customEvent.detail);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const actions = diagramInit(canvas);

    if (instance) {
      actions.addInstance(instance, service);
    }

    document.addEventListener("openDictsModal", openDictsModal);

    return () => {
      document.removeEventListener("openDictsModal", openDictsModal);
      actions.removeCanvas();
    };
  }, [instance, service]);

  return (
    <>
      <Modal
        isOpen={isDialogOpen}
        title={"Dictionary values"}
        variant={"small"}
        onClose={() => {
          setIsDialogOpen(false);
          setStringifiedDicts([]);
        }}
      >
        {stringifiedDicts.map((dict, key) => (
          <pre key={"dict-value-" + key}>
            <code>{`${dict.title}: ${dict.value}`}</code>
          </pre>
        ))}
      </Modal>
      <CanvasWrapper id="canvas-wrapper">
        <div className="canvas" ref={canvas} />
      </CanvasWrapper>
    </>
  );
};
export default Canvas;
