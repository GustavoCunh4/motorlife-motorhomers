import {
  assertLoginAllowed,
  clearLoginFailures,
  createSessionToken,
  registerLoginFailure,
  verifyPassword,
} from "./_admin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo nao permitido." });
  }

  let ip;
  try {
    ip = assertLoginAllowed(req);
  } catch (error) {
    return res.status(error.statusCode || 429).json({ error: error.message });
  }

  const { password } = req.body ?? {};

  if (!verifyPassword(password)) {
    registerLoginFailure(ip);
    return res.status(401).json({ error: "Senha invalida." });
  }

  clearLoginFailures(ip);
  const token = createSessionToken();

  return res.status(200).json({
    token,
    expiresIn: 2 * 60 * 60,
  });
}
