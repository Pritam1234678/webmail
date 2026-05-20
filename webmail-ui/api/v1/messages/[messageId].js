const { allow, json } = require("../../_lib/response");
const { getMessage } = require("../../_lib/data");

module.exports = async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;

  const { messageId } = req.query;
  const message = getMessage(messageId);

  if (!message) {
    return json(res, 404, { ok: false, error: "Message not found" });
  }

  return json(res, 200, {
    ok: true,
    message
  });
};
