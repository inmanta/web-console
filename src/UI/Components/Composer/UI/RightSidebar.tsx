import React, { useContext } from "react";
import {
    Content,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant,
    Flex,
    FlexItem,
    Title,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@/UI/words";
import { ComposerContext } from "../Data/Context";

export const RightSidebar: React.FC = () => {
    const { mainService, activeCell, editable } = useContext(ComposerContext);

    return (
        <Wrapper
            direction={{ default: "column" }}
            spaceItems={{ default: "spaceItemsSm" }}
            flexWrap={{ default: "nowrap" }}
        >
            <FlexItem alignSelf={{ default: "alignSelfCenter" }}>
                <Title headingLevel="h1">{words("details")}</Title>
            </FlexItem>
            {mainService?.description && (
                <Content aria-label="service-description">{mainService.description}</Content>
            )}
            {activeCell && editable ? (
                <Content>Form will be implemented here</Content>
            ) : (
                <Flex flex={{ default: "flex_1" }} alignItems={{ default: "alignItemsCenter" }}>
                    <EmptyState
                        headingLevel="h4"
                        variant={EmptyStateVariant.sm}
                        icon={CubesIcon}
                        titleText={words("instanceComposer.formModal.noElementSelected.title")}
                    >
                        <EmptyStateBody>
                            {words("instanceComposer.formModal.noElementSelected")}
                        </EmptyStateBody>
                    </EmptyState>
                </Flex>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(Flex)`
    height: 100%;
    width: 300px;
    position: absolute;
    z-index: 1px;
    top: 1px;
    right: 1px;
    background: var(--pf-t--global--background--color--primary--default);
    padding: 16px;
    filter: drop-shadow(-0.1rem 0.1rem 0.15rem var(--pf-t--global--box-shadow--color--100));
    overflow: auto;
`;