const folders = [
  { id: "inbox", label: "Inbox", hint: "Priority mail", count: 14, icon: "in" },
  { id: "sent", label: "Sent", hint: "Delivered mail", count: 42, icon: "se" },
  { id: "drafts", label: "Drafts", hint: "Saved for later", count: 3, icon: "dr" },
  { id: "spam", label: "Spam", hint: "Filtered mail", count: 8, icon: "sp" },
  { id: "trash", label: "Trash", hint: "Deleted items", count: 21, icon: "tr" }
];

const mailboxes = [
  { id: "support", email: "support@codecoder.in", name: "Support", initials: "SU", status: "Primary mailbox" },
  { id: "noreply", email: "noreply@codecoder.in", name: "No Reply", initials: "NR", status: "Outbound workflow" }
];

const messages = [
  {
    id: "msg_001",
    mailboxId: "support",
    folder: "inbox",
    senderName: "Aarav Singh",
    senderEmail: "aarav@northstack.io",
    recipients: ["support@codecoder.in"],
    subject: "Production access confirmation for the migration window",
    snippet: "Attaching the final checklist and the access matrix so your team can greenlight the rollout.",
    body: "<p>Hi team,</p><p>We have locked the migration window for tomorrow at 02:00 UTC. The access matrix and rollback checklist are attached below for review.</p><p>Please confirm whether support traffic should be routed to the secondary queue for the first fifteen minutes after cutover.</p><p>Regards,<br>Aarav</p>",
    timestamp: "2026-05-20T00:18:00Z",
    unread: true,
    starred: true,
    tags: ["Ops"],
    attachments: [
      { id: "att_001", name: "cutover-checklist.pdf", size: "1.2 MB", type: "PDF" },
      { id: "att_002", name: "access-matrix.csv", size: "84 KB", type: "CSV" }
    ],
    thread: [
      { author: "Aarav Singh", time: "1h ago", summary: "Shared final migration assets." },
      { author: "Support", time: "47m ago", summary: "Requested confirmation on routing." }
    ]
  },
  {
    id: "msg_002",
    mailboxId: "support",
    folder: "inbox",
    senderName: "Billing Bot",
    senderEmail: "invoices@brevo-alerts.com",
    recipients: ["support@codecoder.in"],
    subject: "Monthly SMTP relay usage summary",
    snippet: "Your relay quota remains healthy. Peak concurrency increased by 11% this week.",
    body: "<p>Usage summary for this cycle:</p><ul><li>Messages sent: 14,228</li><li>Failures: 0.12%</li><li>Peak delivery concurrency: 18</li></ul><p>No manual action required.</p>",
    timestamp: "2026-05-19T22:42:00Z",
    unread: false,
    starred: false,
    tags: ["Reports"],
    attachments: [],
    thread: []
  },
  {
    id: "msg_003",
    mailboxId: "support",
    folder: "drafts",
    senderName: "You",
    senderEmail: "support@codecoder.in",
    recipients: ["vip@clientflow.ai"],
    subject: "Re: Dedicated mailbox onboarding",
    snippet: "Drafting the mailbox mapping details and login instructions for the client handoff.",
    body: "<p>Hello,</p><p>We have provisioned the mailboxes and will share the final login sheet after TLS verification is complete.</p>",
    timestamp: "2026-05-19T20:10:00Z",
    unread: false,
    starred: false,
    tags: ["Draft"],
    attachments: [],
    thread: []
  },
  {
    id: "msg_004",
    mailboxId: "noreply",
    folder: "sent",
    senderName: "Codecoder Mail",
    senderEmail: "noreply@codecoder.in",
    recipients: ["mandalp166@gmail.com"],
    subject: "Your access code has been refreshed",
    snippet: "This is an automated notification. Your account security code has been updated successfully.",
    body: "<p>This message confirms a system-generated account update.</p><p>If you did not request this change, contact support immediately.</p>",
    timestamp: "2026-05-19T18:15:00Z",
    unread: false,
    starred: false,
    tags: ["System"],
    attachments: [],
    thread: []
  },
  {
    id: "msg_005",
    mailboxId: "noreply",
    folder: "spam",
    senderName: "Unknown Sender",
    senderEmail: "bonus@random-cash.biz",
    recipients: ["noreply@codecoder.in"],
    subject: "Urgent reward waiting for you",
    snippet: "Claim your instant transfer today by confirming your account credentials.",
    body: "<p>This looks malicious and is parked here to validate the spam workflow UI.</p>",
    timestamp: "2026-05-19T17:04:00Z",
    unread: true,
    starred: false,
    tags: ["Spam"],
    attachments: [{ id: "att_003", name: "reward.html", size: "18 KB", type: "HTML" }],
    thread: []
  }
];

function getFolderCounts(mailboxId) {
  return folders.map((folder) => ({
    ...folder,
    count: messages.filter((message) => message.mailboxId === mailboxId && message.folder === folder.id).length
  }));
}

function getMessages({ mailboxId, folder, query }) {
  return messages
    .filter((message) => !mailboxId || message.mailboxId === mailboxId)
    .filter((message) => !folder || message.folder === folder)
    .filter((message) => {
      if (!query) return true;
      const haystack = [message.senderName, message.senderEmail, message.subject, message.snippet].join(" ").toLowerCase();
      return haystack.includes(String(query).toLowerCase());
    })
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
}

function getMessage(messageId) {
  return messages.find((message) => message.id === messageId) || null;
}

module.exports = {
  folders,
  mailboxes,
  messages,
  getFolderCounts,
  getMessages,
  getMessage
};
