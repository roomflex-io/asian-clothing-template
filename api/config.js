module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();
  const url = process.env.SUPABASE_URL || "";
  const anon = process.env.SUPABASE_ANON_KEY || "";
  if (!url || !anon) {
    return res.status(200).json({ ok: false, error: "Supabase env vars missing on this deploy." });
  }
  return res.status(200).json({ ok: true, url, anon });
};
