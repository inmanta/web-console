import React from "react";
import styled, { css } from "styled-components";
import { ImageHelper } from "@/Data";

export const ImagePreview: React.FC<{ dataUrl: string }> = ({
  dataUrl,
  ...props
}) =>
  dataUrl !== "" ? (
    <StyledImage
      {...props}
      src={ImageHelper.addDataScheme(dataUrl)}
      alt="image preview"
    />
  ) : (
    <FillerImage {...props}>no icon</FillerImage>
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
  background-color: var(--pf-v5-global--BackgroundColor--200);
  color: var(--pf-v5-global--Color--100);
  text-align: center;
  line-height: 96px;
  font-size: 12px;
  font-weight: bold;
`;
