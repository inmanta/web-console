# Smart Composer

## Installation

There are two requirements that have to be fulfilled to be able to run the Smart Service Composer.

1. The `features` object in the `config.js` file, should contain the property `instanceComposer: true`.
2. The `.yarnrc.yml` file has to get Cloudsmith `<TOKEN>` passed into `${CLOUDSMITH_TOKEN:-<TOKEN>}` to be able to fetch the dependencies on which the Smart Service Composer is built.

In case you decide to run the application without the Smart Service Composer, before installation, remove the `@inmanta/rappid` dependency from `package.json`, to be able to run the application successfully.

## Overview

The Smart Service Composer is a tool built to help visualize relations in the services that the user wants to create/edit in the application.
This document will discuss the technical implementation, the design specifications can be found [here.](https://github.com/inmanta/designs/blob/master/composer/Composer-specifications.md)

## [shapes.ts](../src/UI/Components/Diagram/shapes.ts)

Service Entities are presented with ServiceEntityBlock which extends built-in shape called [HeaderedRectangle](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#shapes.standard.HeaderedRectangle)
[These docs](https://resources.jointjs.com/docs/rappid/v3.5/shapes.standard.html#Record) provide some extra explanation for properties like `itemLabels` etc.
Besides the properties, a ServiceEntityBlock declares some methods to initialize shapes on the canvas and also modify their data and visual presentation.
Information on initialize and preinitialize are available in [this](https://resources.jointjs.com/tutorial/content-driven-element) tutorial

Relations between entities are shown via the `EntityConnection` Class which also is an extension of the built-in feature called [Link](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Link)

## [routers.ts](../src/UI/Components/Diagram/routers.ts)

Routers store and define functions related to the declared anchoring points between each link/relation that should be displayed on the Canvas.
More information will be added when the Smart Service Composer gets updated with actual relations and embedded entities.
[Documentation](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#routers)

## [anchors.ts](../src/UI/Components/Diagram/anchors.ts)

The `anchors.ts` file defines a custom anchor which calculates the position in the bounding box (bbox). Just like the Router Component, the documentation will be changed, and a more detailed explanation will be provided as soon as the final version of the anchors is implemented.
[Docs](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#anchors)

## [actions.ts](../src/UI/Components/Diagram/actions.ts)

The `actions.ts` holds the custom logic to interact with the Entities or connections.
Currently, it contains the functions:

- `showLinkTools` - It displays methods to change/remove a connection between entities.
- `appendInstance` - It converts the Instance passed as argument, to displayable entities on the canvas.

## [init.ts](../src/UI/Components/Diagram/init.ts)

This file holds only one method that is responsible for initialization of the [Graph](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph), [Paper](https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Paper), [Scroller](https://resources.jointjs.com/docs/rappid/v3.6/ui.PaperScroller.html) elements, as well as declaring all event-listener to make entities, connection and canvas-itself interactive.
