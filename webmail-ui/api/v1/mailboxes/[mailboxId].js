const { allow, json } = require("../../_lib/response");
const { mailboxes, getFolderCounts, getMessages } = require("../../_lib/data");

module.exports = async function handler(req, res) {
  if (!allow(req, res, ["GET"])) return;

  const { mailboxId, folder, q } = req.query;
  const mailbox = mailboxes.find((item) => item.id === mailboxId);

  if (!mailbox) {
    return json(res, 404, { ok: false, error: "Mailbox not found" });
  }

  return json(res, 200, {
    ok: true,
    mailbox: {
      ...mailbox,
      folders: getFolderCounts(mailbox.id)
    },
    messages: getMessages({ mailboxId, folder, query: q }).map((message) => ({
      id: message.id,
      mailboxId: message.mailboxId,
      folder: message.folder,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      recipients: message.recipients,
      subject: message.subject,
      snippet: message.snippet,
      timestamp: message.timestamp,
      unread: message.unread,
      starred: message.starred,
      tags: message.tags,
      attachments: message.attachments
    }))
  });
};
