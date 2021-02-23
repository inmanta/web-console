import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { EventIcon } from "./EventIcon";

export default {
  title: "EventIcon",
  component: EventIcon,
};

const EventIconCollection: React.FC = () => {
  return (
    <>
      <div>
        <EventIcon eventType={"ALLOCATION_UPDATE"} />
        ALLOCATION_UPDATE
      </div>
      <div>
        <EventIcon eventType={"API_SET_STATE_TRANSITION"} />
        API_SET_STATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={"AUTO_TRANSITION"} />
        AUTO_TRANSITION
      </div>
      <div>
        <EventIcon eventType={"CREATE_TRANSITION"} />
        CREATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={"ON_DELETE_TRANSITION"} />
        ON_DELETE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={"ON_UPDATE_TRANSITION"} />
        ON_UPDATE_TRANSITION
      </div>
      <div>
        <EventIcon eventType={"RESOURCE_EVENT"} />
        RESOURCE_EVENT
      </div>
      <div>
        <EventIcon eventType={"RESOURCE_TRANSITION"} />
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
