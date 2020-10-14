global.fetch = require("node-fetch");

// Get a list of packageVersionIds
fetch("https://api.github.com/graphql", {
  headers: { "Authorization": `bearer ${process.env.GITHUB_TOKEN}` }, method: 'POST', body:
    JSON.stringify({
      query:
        `{repository(owner:"inmanta",name:"web-console"){packages(first:1){nodes{packageType,name,id,versions(last:30){nodes{id,version,files(first:1){nodes{name, updatedAt}}}}}}}}`
    })
}, (error) => console.log(error)
).then((result) => result.json())
  .then((result) => {
    // Make sure we're working with the web-console
    const webConsole = result.data.repository.packages.nodes.find((package) => package.name === "web-console");

    if (!webConsole) {
      throw Error("Unable to find web-console packages");
    }
    // Take the dev versions only
    const devVersions = webConsole.versions.nodes.filter((packageVersion) => packageVersion.version.includes("dev"));

    // There's only one file per package, the tar.gz
    const devVersionsWithDate = devVersions
      .map((devPackageVersion) => { return { id: devPackageVersion.id, version: devPackageVersion.version, updatedAt: devPackageVersion.files.nodes[0].updatedAt } });

    // Take the versions that are older than 30 days
    const oldDevVersions = devVersionsWithDate
      .filter((devPackageVersion) =>
        Math.floor((new Date() - new Date(devPackageVersion.updatedAt)) / (1000 * 60 * 60 * 24)) > 30);
    if (oldDevVersions.length == 0) {
      console.log("No old versions found matching the criteria");
      return;
    }
    oldDevVersions.map((oldDevVersion) => {
      const idToDelete = oldDevVersion.id;
      console.log(`Attempting to delete version ${oldDevVersion.version} with id ${idToDelete} from ${oldDevVersion.updatedAt}`)
      fetch("https://api.github.com/graphql", {
        headers: { "Authorization": `bearer ${process.env.GITHUB_TOKEN}`, "Accept": "application/vnd.github.package-deletes-preview+json" },
        method: "POST",
        body: JSON.stringify({ query: `mutation { deletePackageVersion(input:{packageVersionId:"${idToDelete}"}) { success }}` })
      }).then((result) => result.json())
        .then((result) => {
          if (result.errors && result.errors.length > 0) {
            console.log(`Deleting package ${idToDelete} failed:`, result.errors);
            throw Error(`Deleting version ${oldDevVersion.id} failed:`, JSON.stringify(result.errors));
          } else {
            console.log(`Successfully deleted package ${idToDelete}`)
          }
        });
    });

  });