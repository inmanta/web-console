/* Monaco Python Worker */
self.onmessage = function (e) {
  // Respond with a basic acknowledgment
  self.postMessage({
    type: "ready",
    id: e.data.id,
  });
};
