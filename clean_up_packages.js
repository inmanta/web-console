// Get a list of packageVersionIds
async function getDevVersions() {
  const getQueryString = (cursor) =>
    `{repository(owner:"inmanta",name:"web-console"){packages(first:1, names:"web-console"){nodes{packageType,name,id,versions(last:50, ${cursor} orderBy:{field:CREATED_AT, direction:DESC}){nodes{id,version,preRelease,files(first:1){nodes{name, updatedAt}}}, pageInfo{hasNextPage, hasPreviousPage,startCursor}}}}}}`;
  let queryString = getQueryString("");
  let moreRows = true;
  while (moreRows) {
    const queryResults = await fetch(
      "https://api.github.com/graphql",
      {
        headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}` },
        method: "POST",
        body: JSON.stringify({
          query: queryString,
        }),
      },
      (error) => console.log(error)
    ).then((result) => {
      return result.json();
    });
    // Make sure we're working with the web-console
    const webConsole = queryResults.data.repository.packages.nodes.find(
      (pkg) => pkg.name === "web-console"
    );

    if (!webConsole) {
      throw Error("Unable to find web-console packages");
    }

    // Take the dev versions only
    const devVersions = webConsole.versions.nodes.filter((packageVersion) =>
      packageVersion.version.includes("dev")
    );

    // Check to see if another page should be queried
    if (
      devVersions.length == 0 &&
      webConsole.versions.pageInfo.hasPreviousPage &&
      webConsole.versions.pageInfo.startCursor
    ) {
      queryString = getQueryString(
        `before: "${webConsole.versions.pageInfo.startCursor}",`
      );
      console.log(
        `No dev versions found on this page of the results, fetching the previous page from ${webConsole.versions.pageInfo.startCursor}`
      );
    } else {
      console.log("Dev versions found, no need to query more pages");
      moreRows = false;
      return devVersions;
    }
  }
}

getDevVersions().then((devVersions) => {
  const devVersionsWithDate = devVersions
    .map((devPackageVersion) => {
      return {
        id: devPackageVersion.id,
        version: devPackageVersion.version,
        updatedAt: devPackageVersion.files.nodes[0].updatedAt,
      };
    })
    .reverse();
  // Take the versions that are older than 30 days
  let oldDevVersions = devVersionsWithDate.filter(
    (devPackageVersion) =>
      Math.floor(
        (new Date() - new Date(devPackageVersion.updatedAt)) /
          (1000 * 60 * 60 * 24)
      ) > 30
  );
  if (oldDevVersions.length == 0) {
    console.log("No old versions found matching the criteria");
    return;
  }
  // Make sure we're not starting too many requests at once
  if (oldDevVersions.length > 5) {
    oldDevVersions = oldDevVersions.slice(0, 5);
  }
  oldDevVersions.map((oldDevVersion) => {
    const idToDelete = oldDevVersion.id;
    console.log(
      `Attempting to delete version ${oldDevVersion.version} with id ${idToDelete} from ${oldDevVersion.updatedAt}`
    );
    fetch("https://api.github.com/graphql", {
      headers: {
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.package-deletes-preview+json",
      },
      method: "POST",
      body: JSON.stringify({
        query: `mutation { deletePackageVersion(input:{packageVersionId:"${idToDelete}"}) { success }}`,
      }),
    })
      .then((result) => result.json())
      .then((result) => {
        if (result.errors && result.errors.length > 0) {
          console.log(`Deleting package ${idToDelete} failed:`, result.errors);
          throw Error(
            `Deleting version ${oldDevVersion.id} failed:`,
            JSON.stringify(result.errors)
          );
        } else {
          console.log(`Successfully deleted package ${idToDelete}`);
        }
      });
  });
});
