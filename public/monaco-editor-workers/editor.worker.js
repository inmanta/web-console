/* Monaco Editor Worker */
self.onmessage = function (e) {
  // Basic editor worker implementation
  console.log("Editor Worker received message:", e.data);

  // Respond with a basic acknowledgment
  self.postMessage({
    type: "ready",
    id: e.data.id,
  });
};
