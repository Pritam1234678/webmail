function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function allow(req, res, methods) {
  if (!methods.includes(req.method)) {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return false;
  }

  return true;
}

module.exports = {
  json,
  allow
};
