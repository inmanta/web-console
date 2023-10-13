function getLinkToNextPage(headerObj) {
  /**
   *  Takes the Header object and returns the URL to the next page or null if no such page exists.
   *
   *  Format of link_header: '<URL>; rel="next", <URL>; rel="last"' where URL is a URL to a certain page.
   */
  if (!headerObj.has("link")) {
    return null;
  }
  const linkHeader = headerObj.get("link");
  const splittedLinkHeader = linkHeader.trim().split(",");
  for (let i = 0; i < splittedLinkHeader.length; i++) {
    const splittedHeaderParts = splittedLinkHeader[i].trim().split(";");
    const refName = splittedHeaderParts[1].trim();
    const refLink = splittedHeaderParts[0].trim();
    if (refName === 'rel="next"') {
      // The link is represented as '<url>'. This chops off the '<' and '>' characters.
      return refLink.slice(1, refLink.length - 1);
    }
  }
  return null;
}

async function getOldDevVersions() {
  /**
   *  Return a list of development packages that is older than 30 days.
   *  The list of packages return by this method is not necessarily complete.
   *  This is intentional, because we don't want to execute too many requests at once.
   */
  let queryUrl =
    "https://api.github.com/orgs/inmanta/packages/npm/web-console/versions?per_page=100";
  let result = [];
  while (true) {
    // This API endpoint sorts the packages from new to old.
    const queryResults = await fetch(
      queryUrl,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        method: "GET",
      },
      (error) => console.log(error),
    );
    const packages = await queryResults.json();
    const response_headers = queryResults.headers;

    if (!packages || !packages.length) {
      throw Error("Unable to find web-console packages");
    }

    // Take the dev versions only
    const devVersions = packages.filter((pkg) => pkg.name.includes("dev"));
    const devVersionsWithDate = devVersions.map((devPackageVersion) => {
      return {
        id: devPackageVersion.id,
        version: devPackageVersion.name,
        updatedAt: devPackageVersion.updated_at,
      };
    });
    // Take the versions that are older than 30 days
    const oldDevVersions = devVersionsWithDate.filter(
      (devPackageVersion) =>
        Math.floor(
          (new Date() - new Date(devPackageVersion.updatedAt)) /
            (1000 * 60 * 60 * 24),
        ) > 30,
    );

    if (result.length > 0 && oldDevVersions.length === 0) {
      // We probably cleaned up until here during the previous run of this script.
      // Don't go further back in history to limit the amount of requests.
      return result;
    }
    result = result.concat(oldDevVersions);
    if (result.length > 5) {
      // Return as soon as we have at least five packages to not execute too many requests at once.
      return result;
    }

    // Check to see if another page should be queried
    const linkToNextPage = getLinkToNextPage(response_headers);
    if (linkToNextPage != null) {
      queryUrl = linkToNextPage;
      console.log(`Fetching the next page from ${queryUrl}`);
    } else {
      if (result.length === 0) {
        console.log("No dev version exist");
      }
      return result;
    }
  }
}

getOldDevVersions().then(
  (oldDevVersions) => {
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
        `Attempting to delete version ${oldDevVersion.version} with id ${idToDelete} from ${oldDevVersion.updatedAt}`,
      );
      fetch(
        `https://api.github.com/orgs/inmanta/packages/npm/web-console/versions/${idToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          method: "DELETE",
        },
      ).then(
        (response) => {
          if (response.ok) {
            console.log(`Successfully deleted package ${idToDelete}`);
          } else {
            const error_message = `Deleting package ${idToDelete} failed: ${response.statusText}`;
            console.log(error_message);
            throw Error(error_message);
          }
        },
        (reason) => {
          console.log(reason);
        },
      );
    });
  },
  (reason) => {
    console.log(`Failed to retrieve dev packages: ${reason}`);
  },
);
