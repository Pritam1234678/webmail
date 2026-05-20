const { allow, json } = require("../../_lib/response");

module.exports = async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;

  return json(res, 200, {
    ok: true,
    user: {
      userId: "support",
      mailboxId: "support",
      email: "support@codecoder.in",
      displayName: "Support",
      role: "owner"
    }
  });
};
