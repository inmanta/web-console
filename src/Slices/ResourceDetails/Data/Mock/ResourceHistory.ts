export const response = {
  data: [
    {
      resource_id: "std::File[internal,path=/tmp/dir1/file2]",
      date: "2021-07-07T12:00:00.000000",
      attributes: {
        key3: "val3updated",
        path: "/tmp/dir1/file2",
        requires: ["std::Directory[internal,path=/tmp/dir1],v=4"],
      },
      attribute_hash: "ab754aecaa21b8f3003b671df71a905f",
      requires: ["std::Directory[internal,path=/tmp/dir1]"],
    },
    {
      resource_id: "std::File[internal,path=/tmp/dir1/file2]",
      date: "2021-07-07T10:00:00.000000",
      attributes: {
        key3: "val3",
        path: "/tmp/dir1/file2",
        requires: ["std::Directory[internal,path=/tmp/dir1],v=2"],
      },
      attribute_hash: "cf002639b61454c7f1c7b9994193011d",
      requires: ["std::Directory[internal,path=/tmp/dir1]"],
    },
  ],
  links: {
    self: "/api/v2/resource/std%3A%3AFile%5Binternal%2Cpath%3D%2Ftmp%2Fdir1%2Ffile2%5D/history?limit=20&sort=date.DESC",
  },
  metadata: { total: 2, before: 0, after: 2, page_size: 20 },
};
