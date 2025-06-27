/* Monaco JSON Worker */
self.onmessage = function (e) {
  // Basic JSON worker implementation
  console.log("JSON Worker received message:", e.data);

  // Respond with a basic acknowledgment
  self.postMessage({
    type: "ready",
    id: e.data.id,
  });
};
