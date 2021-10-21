import { ClipboardCheckIcon } from "@patternfly/react-icons";
import styled from "styled-components";

export const DefaultIcon = styled(ClipboardCheckIcon)<{ isDisabled?: boolean }>`
  opacity: ${(p) => (p.isDisabled ? "0.2" : "1")};
`;
