import React from "react";
import { BackgroundImage } from "@patternfly/react-core";
import filter from "@patternfly/patternfly/assets/images/background-filter.svg";

export class SimpleBackgroundImage extends React.Component {
  private images = {
    filter: `${filter}#image_overlay`,
    lg: `${process.env.PUBLIC_PATH}images/pfbg_2000.jpg`,
    sm: `${process.env.PUBLIC_PATH}./images/pfbg_768.jpg`,
    sm2x: `${process.env.PUBLIC_PATH}./images/pfbg_768@2x.jpg`,
    xs: `${process.env.PUBLIC_PATH}images/pfbg_576.jpg`,
    xs2x: `${process.env.PUBLIC_PATH}/images/pfbg_576@2x.jpg`,
  };

  constructor(props: Record<string, unknown>) {
    super(props);
  }

  public render(): JSX.Element {
    return <BackgroundImage src={this.images} alt="Background image" />;
  }
}
