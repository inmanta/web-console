import { useEffect } from "react";
import { useContext } from "react";
import { Content, Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@/Core";
import { Spinner } from "@/UI/Components/Spinner";
import { ModalContext } from "@/UI/Dependency/ModalContext";

const SpinnerContent = ({ message }: { message: string }) => (
  <Flex
    direction={{ default: "column" }}
    justifyContent={{ default: "justifyContentCenter" }}
    alignItems={{ default: "alignItemsCenter" }}
    style={{ height: "140px" }}
  >
    <FlexItem>
      <Content component="h2" data-testid="blocking-modal-message">
        {message}
      </Content>
    </FlexItem>
    <FlexItem>
      <Spinner size={24} />
    </FlexItem>
  </Flex>
);

export const BlockingModal = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);

  useEffect(() => {
    const toggleModalHalt = () => {
      triggerModal({
        title: "",
        content: <SpinnerContent message={words("environment.halt.process")} />,
        showClose: false,
      });
    };

    const toggleModalResume = () => {
      triggerModal({
        title: "",
        content: <SpinnerContent message={words("environment.resume.process")} />,
        showClose: false,
      });
    };

    document.addEventListener("close-blocking-modal", closeModal);
    document.addEventListener("halt-event", toggleModalHalt);
    document.addEventListener("resume-event", toggleModalResume);

    return () => {
      document.removeEventListener("close-blocking-modal", closeModal);
      document.removeEventListener("halt-event", toggleModalHalt);
      document.removeEventListener("resume-event", toggleModalResume);
    };
  }, [triggerModal, closeModal]);

  return null;
};
