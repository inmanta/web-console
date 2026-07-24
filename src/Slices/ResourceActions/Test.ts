import { ResourceAction } from "./Core/Domain";

/**
 * Mock resource actions used in tests.
 */
export const mockResourceActions: ResourceAction[] = [
  {
    environment: "env-1",
    version: 1705,
    resource_version_ids: ["std::testing::NullResource[internal,name=one],v=1705"],
    action_id: "ebea32fe-aec5-409b-ba17-8aac2b51df91",
    action: "deploy",
    started: "2026-07-23T03:52:01.756448+00:00",
    finished: "2026-07-23T03:52:03.430422+00:00",
    messages: [
      {
        msg: "Start run because previous deploy happened more than 180s ago",
        args: [],
        level: "DEBUG",
        kwargs: { reason: "previous deploy happened more than 180s ago" },
        timestamp: "2026-07-23T03:52:01.756448+00:00",
      },
    ],
    status: "deployed",
    changes: null,
    change: "updated",
    send_event: null,
  },
  {
    environment: "env-1",
    version: 1705,
    resource_version_ids: ["std::testing::NullResource[internal,name=two],v=1705"],
    action_id: "c2827a3e-9077-44c5-973c-4553a3e4c85a",
    action: "dryrun",
    started: "2026-07-23T03:49:01.776410+00:00",
    finished: "2026-07-23T03:49:03.034390+00:00",
    messages: [],
    status: "deployed",
    changes: null,
    change: "created",
    send_event: null,
  },
  {
    environment: "env-1",
    version: 1705,
    resource_version_ids: [
      "std::testing::NullResource[internal,name=three],v=1705",
      "std::testing::NullResource[internal,name=four],v=1705",
    ],
    action_id: "a1b2c3d4-0000-0000-0000-000000000000",
    action: "store",
    started: "2026-07-23T03:40:00.000000+00:00",
    finished: "2026-07-23T03:40:00.500000+00:00",
    messages: [],
    status: null,
    changes: null,
    change: null,
    send_event: null,
  },
];

export const mockResourceActionsResponse = {
  data: mockResourceActions,
  links: {
    self: "/api/v2/resource_actions?limit=20",
    next: "/api/v2/resource_actions?limit=20&last_timestamp=2026-07-23T03%3A49%3A01.776410%2B00%3A00&action_id=c2827a3e-9077-44c5-973c-4553a3e4c85a",
  },
};
