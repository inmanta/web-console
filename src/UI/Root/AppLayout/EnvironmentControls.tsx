import { RemoteData } from "@/Core";
import {
  Button,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import {
  CheckIcon,
  ExclamationTriangleIcon,
  TimesIcon,
} from "@patternfly/react-icons";
import React, { useContext } from "react";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { LoadingView } from "@/UI/Components";
import { ResumeDialog } from "./ResumeDialog";
import { HaltDialog } from "./HaltDialog";

export const EnvironmentControls: React.FC = () => {
  const { queryResolver, urlManager } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetEnvironmentDetails">({
    kind: "GetEnvironmentDetails",
  });
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: () => (
        <PaddedStack>
          <StackItem>
            <Flex>
              <FlexItem>
                <Button
                  variant="danger"
                  aria-label="Server status"
                  icon={<TimesIcon />}
                  component="a"
                  href={urlManager.getServerStatusUrl()}
                  target="_blank"
                />
              </FlexItem>
              <FlexItem>
                <Button variant="danger" isDisabled />
              </FlexItem>
            </Flex>
          </StackItem>
        </PaddedStack>
      ),
      success: (data) => {
        return (
          <PaddedStack>
            <PaddedStackItem>
              {data.halted && (
                <Label color="orange" icon={<ExclamationTriangleIcon />}>
                  {words("environment.halt.label")}
                </Label>
              )}
            </PaddedStackItem>
            <StackItem>
              <Flex>
                <FlexItem>
                  <GreenButton
                    icon={<CheckIcon />}
                    component="a"
                    aria-label="Server status"
                    href={urlManager.getServerStatusUrl()}
                    target="_blank"
                  />
                </FlexItem>
                <FlexItem>
                  {data.halted ? <ResumeDialog /> : <HaltDialog />}
                </FlexItem>
              </Flex>
            </StackItem>
          </PaddedStack>
        );
      },
    },
    data
  );
};

const GreenButton = styled(Button)`
  && {
    background-color: var(--pf-global--success-color--100);
  }
`;

const PaddedStack = styled(Stack)`
  padding-left: 1.5rem;
`;
const PaddedStackItem = styled(StackItem)`
  padding-bottom: 1rem;
`;
