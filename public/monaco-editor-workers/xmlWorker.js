/* Monaco XML Worker */
self.onmessage = function (e) {
  // Basic XML worker implementation
  console.log("XML Worker received message:", e.data);

  // Respond with a basic acknowledgment
  self.postMessage({
    type: "ready",
    id: e.data.id,
  });
};
