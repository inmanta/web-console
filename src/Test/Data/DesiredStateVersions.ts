export const response = {
  data: [
    {
      version: 9,
      date: "2021-12-06T07:08:00.000000",
      total: 1,
      labels: [
        {
          name: "lsm_export",
          message: "Recompile model because state transition",
        },
      ],
      status: "candidate",
    },
    {
      version: 8,
      date: "2021-12-06T06:07:00.000000",
      total: 1,
      labels: [
        {
          name: "param",
          message:
            "Recompile model because one or more parameters were updated",
        },
      ],
      status: "candidate",
    },
    {
      version: 7,
      date: "2021-12-06T05:06:00.000000",
      total: 1,
      labels: [
        {
          name: "lsm_export",
          message: "Recompile model because state transition",
        },
      ],
      status: "active",
    },
    {
      version: 6,
      date: "2021-12-06T04:05:00.000000",
      total: 1,
      labels: [
        {
          name: "param",
          message:
            "Recompile model because one or more parameters were updated",
        },
      ],
      status: "skipped_candidate",
    },
    {
      version: 5,
      date: "2021-12-06T03:04:00.000000",
      total: 1,
      labels: [
        {
          name: "lsm_export",
          message: "Recompile model because state transition",
        },
      ],
      status: "skipped_candidate",
    },
    {
      version: 4,
      date: "2021-12-06T02:03:00.000000",
      total: 1,
      labels: [
        {
          name: "param",
          message:
            "Recompile model because one or more parameters were updated",
        },
      ],
      status: "skipped_candidate",
    },
    {
      version: 3,
      date: "2021-12-06T01:02:00.000000",
      total: 1,
      labels: [
        {
          name: "lsm_export",
          message: "Recompile model because state transition",
        },
      ],
      status: "retired",
    },
    {
      version: 2,
      date: "2021-12-06T00:01:00.000000",
      total: 1,
      labels: [
        {
          name: "param",
          message:
            "Recompile model because one or more parameters were updated",
        },
      ],
      status: "retired",
    },
    {
      version: 1,
      date: "2021-12-05T23:00:00.000000",
      total: 1,
      labels: [
        {
          name: "lsm_export",
          message: "Recompile model because state transition",
        },
      ],
      status: "skipped_candidate",
    },
  ],
  links: {
    self: "/api/v2/desiredstate?limit=20&sort=version.DESC&filter.status=skipped_candidate&filter.status=active&filter.status=candidate&filter.status=retired",
  },
  metadata: { total: 9, before: 0, after: 0, page_size: 20 },
};
