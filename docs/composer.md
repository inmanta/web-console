# Smart Composer

## Installation

There are two requirements have to be fulfilled to be able to run Smart Composer

1. features object in the **config.js** should contain `instanceComposer: true` property
2. The **.yarnrc.yml** file has to be updated with Cloudsmith <TOKEN> to be able to fetch dependency on which composer is built.

In case when you decide to run application without the composer, remove `@inmanta/rappid` dependency from **package.json**, before installation, to be able to run application successfully

## Overview

Smart Composer is a tool built to help visualize relations in the services that user want to create or build in application.
Detailed.
We will try to keep this file as single source of technical details about the implementation and the more theoretical information which should be treated as prerequisite is available [here.](https://github.com/inmanta/designs/blob/master/composer/Composer-specifications.md)

## [shapes.ts](../src/UI/Components/Diagram/shapes.ts)

Service Entities are presented with ServiceEntityBlock which extends built-in shape called [HeaderedRectangle](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#shapes.standard.HeaderedRectangle)
[These docs](https://resources.jointjs.com/docs/rappid/v3.5/shapes.standard.html#Record) provide some extra explanation for properties like `itemLabels` etc.
Beside the properties ServiceEntityBlock declares some methods to initialize shapes on canvas and also modify their data and visual presentation.
Information on initialize and preinitialize are available in [this](https://resources.jointjs.com/tutorial/content-driven-element) tutorial

Relations between entities are shown via EntityConnection class which also is extension of built-in feature called [Link](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Link)

## [routers.ts](../src/UI/Components/Diagram/routers.ts)

Routers stores and defines functions related to the that declares anchoring points between each link/relation should be displayed.
This isn't in the final version and will be explained as relations will be adjusted accordingly.
[Documentation](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#routers)

## [anchors.ts](../src/UI/Components/Diagram/anchors.ts)

Anchors file defines custom anchor which calculates position in the bounding box(bbox). Likewise Router it will be changed and more detailed explanation will be provided as soon as final version of the anchors will be implemented.
[Docs](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#anchors)

## [actions.ts](../src/UI/Components/Diagram/actions.ts)

Actions holds all of the custom logic to interact with the Entities or connections.
Currently holds functions:

- `showLinkTools` - displays methods to change/remove connection between entities
- `appendInstance` - convert passed Instance to displayable entities on the canvas

## [init.ts](../src/UI/Components/Diagram/init.ts)

This file holds only one method that is responsible for initialization of the [Graph](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph), [Paper](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Paper), [Scroller](https://resources.jointjs.com/docs/rappid/v3.6/ui.PaperScroller.html) elements, as well as declaring all event-listener to make entities, connection and canvas-itself interactive.
