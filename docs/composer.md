# Smart Composer

## Installation
There are two requirements have to be fulfilled to be able to run Smart Composer 
1. features object in the **config.js**  should contain `instanceComposer: true` property
2. The **.npmrc** file has to be updated with Cloudsmith <TOKEN> to be able to fetch dependency on which composer is built.

In case when you decide to run application without the composer, remove `@inmanta/rappid` dependency from **package.json**, before installation, to be able to run application successfully 
 
Important note: as for 18.04.23 `yarn install` times out when trying to download @inmanta/rappid package, `npm install` does work instead. We reported issue to the Cloudsmith if they can provide some information about that, as other sources doesn't gave any helpful advices.

## Overview
Smart Composer is a tool built to help visualize relations in the services that user want to create or build in application.
Detailed. 
We will try to keep this file as single source of technical details about the implementation and the more theoretical information which should be treated as prerequisite is available [here.](https://github.com/inmanta/designs/blob/master/composer/Composer-specifications.md)
