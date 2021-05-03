import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { EventIcon } from "./EventIcon";
import { InstanceEventType } from "@/Core";

export default {
  title: "EventIcon",
  component: EventIcon,
};

const EventIconCollection: React.FC = () => {
  return (
    <>
      <div>
        <EventIcon eventType={InstanceEventType.ALLOCATION_UPDATE} />
        ALLOCATION_UPDATE
      </div>
      <div>
        <EventIcon eventType={InstanceEventType.API_SET_STATE_TRANSITION} />
        API_SET_STATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={InstanceEventType.AUTO_TRANSITION} />
        AUTO_TRANSITION
      </div>
      <div>
        <EventIcon eventType={InstanceEventType.CREATE_TRANSITION} />
        CREATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={InstanceEventType.ON_DELETE_TRANSITION} />
        ON_DELETE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={InstanceEventType.ON_UPDATE_TRANSITION} />
        ON_UPDATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={InstanceEventType.RESOURCE_EVENT} />
        RESOURCE_EVENT
      </div>
      <div>
        <EventIcon eventType={InstanceEventType.RESOURCE_TRANSITION} />
        RESOURCE_TRANSITION
      </div>
    </>
  );
};

const Template: Story<ComponentProps<typeof EventIconCollection>> = (args) => (
  <>
    <EventIconCollection {...args} />
  </>
);
export const AllIcons = Template.bind({});
