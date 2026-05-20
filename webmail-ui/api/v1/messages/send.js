const { allow, json } = require("../../_lib/response");

module.exports = async function handler(req, res) {
  if (!allow(req, res, ["POST"])) return;

  return json(res, 202, {
    ok: true,
    queued: true,
    message: "Mock send accepted. Replace this handler with Postfix submission wiring on mail.codecoder.in.",
    id: `queued_${Date.now()}`
  });
};
