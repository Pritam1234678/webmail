const { allow, json } = require("../../_lib/response");

module.exports = async function handler(req, res) {
  if (!allow(req, res, ["POST", "DELETE"])) return;

  if (req.method === "POST") {
    return json(res, 200, {
      ok: true,
      session: {
        userId: "support",
        mailboxId: "support",
        email: "support@codecoder.in",
        displayName: "Support"
      }
    });
  }

  return json(res, 200, { ok: true });
};
