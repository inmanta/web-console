import React from "react";
import styled, { css } from "styled-components";
import { ImageHelper } from "@/Data";

export const ImagePreview: React.FC<{ dataUrl: string }> = ({ dataUrl }) =>
  dataUrl !== "" ? (
    <StyledImage
      src={ImageHelper.addDataScheme(dataUrl)}
      alt="image preview"
      aria-label="image preview"
    />
  ) : (
    <FillerImage>no icon</FillerImage>
  );

const dimensions = css`
  display: block;
  margin-bottom: 8px;
  width: 96px;
  height: 96px;
`;

const StyledImage = styled.img`
  ${dimensions};
  object-fit: contain;
`;

const FillerImage = styled.div`
  ${dimensions};
  background-color: var(--pf-global--BackgroundColor--200);
  color: var(--pf-global--Color--100);
  text-align: center;
  line-height: 96px;
  font-size: 12px;
  font-weight: bold;
`;
