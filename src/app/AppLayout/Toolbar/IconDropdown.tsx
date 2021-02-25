import React, { ComponentClass } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownPosition,
} from "@patternfly/react-core";
import { SVGIconProps } from "@patternfly/react-icons/dist/js/createIcon";

interface Props {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  icon: ComponentClass<SVGIconProps, any>;
  dropdownItems: JSX.Element[];
}

export class IconDropdown extends React.Component<Props, { isOpen: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.onToggle = this.onToggle.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  public render(): JSX.Element {
    const { isOpen } = this.state;
    return (
      <Dropdown
        onSelect={this.onSelect}
        toggle={
          <DropdownToggle
            toggleIndicator={null}
            onToggle={this.onToggle}
            aria-label="Applications"
            isDisabled={
              !this.props.dropdownItems || this.props.dropdownItems.length === 0
            }
          >
            <this.props.icon />
          </DropdownToggle>
        }
        isOpen={isOpen}
        position={DropdownPosition.right}
        isPlain={true}
        dropdownItems={this.props.dropdownItems}
      />
    );
  }

  private onToggle(isOpen: boolean): void {
    this.setState({
      isOpen,
    });
  }

  private onSelect(): void {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }
}
