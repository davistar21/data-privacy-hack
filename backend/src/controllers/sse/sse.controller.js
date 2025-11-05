let clients = [];

export const registerSSEClient = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  req.on("close", () => {
    clients = clients.filter((c) => c.id !== clientId);
  });
};

export function broadcastRevocationEvent(eventData) {
  clients.forEach(({ res }) => {
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  });
}
