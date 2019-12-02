import React from 'react';
import { BackgroundImage, BackgroundImageSrc } from '@patternfly/react-core';
import filter from "@patternfly/patternfly/assets/images/background-filter.svg";

class SimpleBackgroundImage extends React.Component {
  private images = {
    [BackgroundImageSrc.xs]: `${process.env.PUBLIC_PATH}images/pfbg_576.jpg`,
    [BackgroundImageSrc.xs2x]: `${process.env.PUBLIC_PATH}/images/pfbg_576@2x.jpg`,
    [BackgroundImageSrc.sm]: `${process.env.PUBLIC_PATH}./images/pfbg_768.jpg`,
    [BackgroundImageSrc.sm2x]: `${process.env.PUBLIC_PATH}./images/pfbg_768@2x.jpg`,
    [BackgroundImageSrc.lg]: `${process.env.PUBLIC_PATH}images/pfbg_2000.jpg`,
    [BackgroundImageSrc.filter]: `${filter}#image_overlay`
  };
  constructor(props) {
    super(props);
  }
  public render() {
    return <BackgroundImage src={this.images} alt="Background image" />;
  }
}

export default SimpleBackgroundImage;
