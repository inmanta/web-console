import React, { useEffect, useRef, useState } from "react";
import "@inmanta/rappid/rappid.css";
import { Modal } from "@patternfly/react-core";
import styled from "styled-components";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import diagramInit, { DiagramHandlers } from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import FormModal from "./components/FormModal";
import Toolbar from "./components/Toolbar";
import { DictDialogData } from "./interfaces";

const Canvas = ({
  services,
  mainService,
  instance,
}: {
  services: ServiceModel[];
  mainService: string;
  instance?: ServiceInstanceModel;
}) => {
  const canvas = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [stringifiedDict, setStringifiedDict] = useState<DictDialogData | null>(
    null
  );
  const [diagramHandlers, setDiagramHandlers] =
    useState<DiagramHandlers | null>(null);

  //const actions = diagramInit(canvas);
  const handleEvent = (event) => {
    const customEvent = event as CustomEvent;
    setStringifiedDict(customEvent.detail);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const actions = diagramInit(canvas);
    setDiagramHandlers(actions);
    if (instance) {
      actions.addInstance(
        instance,
        services.find((service) => service.name === mainService) as ServiceModel
      );
    }

    return () => {
      actions.removeCanvas();
    };
  }, [instance, services, mainService]);

  useEffect(() => {
    document.addEventListener("openDictsModal", handleEvent);

    return () => {
      document.removeEventListener("openDictsModal", handleEvent);
    };
  }, []);
  return (
    <Container>
      <Modal
        isOpen={isDialogOpen}
        title={"Dictionary values"}
        variant={"small"}
        onClose={() => {
          setIsDialogOpen(false);
          setStringifiedDict(null);
        }}
      >
        {stringifiedDict && (
          <pre>
            <code>{`${stringifiedDict.title}: ${stringifiedDict.value}`}</code>
          </pre>
        )}
      </Modal>
      <FormModal
        isOpen={isFormModalOpen}
        toggleIsOpen={(value: boolean) => setIsFormModalOpen(value)}
        services={services}
        onConfirm={(entity, entityName) => {
          if (diagramHandlers) {
            diagramHandlers.addEntity(
              entity,
              services.find(
                (service) => service.name === entityName
              ) as ServiceModel
            );
          }
        }}
      />
      <Toolbar
        openEntityModal={() => setIsFormModalOpen(true)}
        serviceName={mainService}
      />
      <CanvasWrapper id="canvas-wrapper">
        <div className="canvas" ref={canvas} />
      </CanvasWrapper>
    </Container>
  );
};
export default Canvas;

const Container = styled.div`
  margin: 0 40px;
  height: 100%;
`;
