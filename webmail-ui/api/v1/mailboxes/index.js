const { allow, json } = require("../../_lib/response");
const { mailboxes, getFolderCounts } = require("../../_lib/data");

module.exports = async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;

  return json(res, 200, {
    ok: true,
    mailboxes: mailboxes.map((mailbox) => ({
      ...mailbox,
      folders: getFolderCounts(mailbox.id)
    }))
  });
};
