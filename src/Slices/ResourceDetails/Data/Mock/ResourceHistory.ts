// Generate dates 4 years ago from now to ensure consistent "4 years ago" display in test data
const now = new Date();
const fourYearsAgo1 = new Date(
  Date.UTC(
    now.getUTCFullYear() - 4,
    6, // July (0-indexed)
    7, // 7th
    12, // 12:00
    0,
    0,
    0
  )
);

const fourYearsAgo2 = new Date(
  Date.UTC(
    now.getUTCFullYear() - 4,
    6, // July (0-indexed)
    7, // 7th
    10, // 10:00
    0,
    0,
    0
  )
);

// Format as ISO string without timezone (matching the format we expect from the API)
const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000000`;
};

export const response = {
  data: [
    {
      resource_id: "std::File[internal,path=/tmp/dir1/file2]",
      date: formatDate(fourYearsAgo1),
      attributes: {
        key3: "val3updated",
        path: "/tmp/dir1/file2",
        requires: ["std::Directory[internal,path=/tmp/dir1],v=4"],
      },
      attribute_hash: "ab754aecaa21b8f3003b671df71a905f",
      requires: [
        "std::Directory[internal,path=/tmp/dir1]",
        "std::Directory[internal,path=/tmp/dir1]",
      ],
    },
    {
      resource_id: "std::File[internal,path=/tmp/dir1/file2]",
      date: formatDate(fourYearsAgo2),
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
