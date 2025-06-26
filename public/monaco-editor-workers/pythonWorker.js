/* Monaco Python Worker */
self.onmessage = function (e) {
    // Basic Python worker implementation
    console.log('Python Worker received message:', e.data);

    // Respond with a basic acknowledgment
    self.postMessage({
        type: 'ready',
        id: e.data.id
    });
}; 