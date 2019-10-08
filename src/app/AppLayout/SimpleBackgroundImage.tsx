import React from 'react';
import { BackgroundImage, BackgroundImageSrc } from '@patternfly/react-core';

class SimpleBackgroundImage extends React.Component {
  private images = {
    [BackgroundImageSrc.xs]: '/images/pfbg_576.jpg',
    [BackgroundImageSrc.xs2x]: '/images/pfbg_576@2x.jpg',
    [BackgroundImageSrc.sm]: '/images/pfbg_768.jpg',
    [BackgroundImageSrc.sm2x]: '/images/pfbg_768@2x.jpg',
    [BackgroundImageSrc.lg]: '/images/pfbg_2000.jpg'
  };
  constructor(props) {
    super(props);
  }
  public render() {
    return <BackgroundImage src={this.images} alt="Background image" />;
  }
}

export default SimpleBackgroundImage;
