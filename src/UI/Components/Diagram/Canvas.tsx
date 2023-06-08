import React, { useEffect, useRef, useState } from "react";
import "@inmanta/rappid/rappid.css";
import { Button, Flex, FlexItem, Modal } from "@patternfly/react-core";
import styled from "styled-components";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import diagramInit from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import { words } from "@/UI/words";
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
  const [stringifiedDicts, setStringifiedDicts] = useState<DictDialogData[]>(
    []
  );
  useEffect(() => {
    const actions = diagramInit(canvas);

    if (instance) {
      actions.addInstance(
        instance,
        services.find((service) => service.name === mainService) as ServiceModel
      );
    }

    document.addEventListener("openDictsModal", (event) => {
      const customEvent = event as CustomEvent;
      setStringifiedDicts(customEvent.detail);
      setIsDialogOpen(true);
    });

    return () => {
      document.removeEventListener("openDictsModal", (event) => {
        const customEvent = event as CustomEvent;
        setStringifiedDicts(customEvent.detail);
        setIsDialogOpen(true);
      });
      actions.removeCanvas();
    };
  }, [instance, services, mainService]);

  return (
    <Container>
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
      <Toolbar
        justifyContent={{
          default: "justifyContentSpaceBetween",
        }}
      >
        <FlexItem>
          <Flex spacer={{ default: "spacerXs" }}>
            <Button variant="plain">1</Button>
            <Button variant="plain">2</Button>
            <Spacer />
            <Button variant="plain">3</Button>
          </Flex>
        </FlexItem>
        <FlexItem>
          <Flex spacer={{ default: "spacerMd" }}>
            <StyledButton variant="tertiary" width={200}>
              {words("cancel")}
            </StyledButton>
            <StyledButton variant="primary" width={200}>
              {words("deploy")}
            </StyledButton>
          </Flex>
        </FlexItem>
      </Toolbar>
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
const Toolbar = styled(Flex)`
  padding: 0 0 20px;
`;
const StyledButton = styled(Button)`
  --pf-c-button--after--BorderRadius: 0;
  --pf-c-button--BorderRadius: 0;
  width: 150px;
`;
const Spacer = styled.div`
  height: 36px;
  width: 1px;
  background: #e7e7e7;
`;
