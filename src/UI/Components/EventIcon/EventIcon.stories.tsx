import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { EventType } from "@/Core";
import { EventIcon } from "./EventIcon";

export default {
  title: "EventIcon",
  component: EventIcon,
};

const EventIconCollection: React.FC = () => {
  return (
    <>
      <div>
        <EventIcon eventType={EventType.ALLOCATION_UPDATE} />
        ALLOCATION_UPDATE
      </div>
      <div>
        <EventIcon eventType={EventType.API_SET_STATE_TRANSITION} />
        API_SET_STATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={EventType.AUTO_TRANSITION} />
        AUTO_TRANSITION
      </div>
      <div>
        <EventIcon eventType={EventType.CREATE_TRANSITION} />
        CREATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={EventType.ON_DELETE_TRANSITION} />
        ON_DELETE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={EventType.ON_UPDATE_TRANSITION} />
        ON_UPDATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={EventType.RESOURCE_EVENT} />
        RESOURCE_EVENT
      </div>
      <div>
        <EventIcon eventType={EventType.RESOURCE_TRANSITION} />
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
