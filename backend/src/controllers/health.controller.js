export function getHealth(_req, res) {
  res.json({ ok: true, service: "apa-asistente-extension-api" });
}

//testing endpoint - old padron
export function testOldPadron(_req, res) {
  res.json({ ok: true, message: "Endpoint working for old padron tab" });
}
