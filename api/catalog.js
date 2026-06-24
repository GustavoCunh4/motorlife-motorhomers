import { normalizeCatalog, normalizeConfig, verifySessionToken } from "./_admin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo nao permitido." });
  }

  if (!verifySessionToken(req)) {
    return res.status(401).json({ error: "Sessao expirada. Entre novamente." });
  }

  try {
    const catalog = normalizeCatalog(req.body?.catalog);
    const config = normalizeConfig(req.body?.config);

    await updateGithubFile("catalog.json", JSON.stringify(catalog, null, 2) + "\n", "Atualizar catalogo via admin");
    await updateGithubFile("site-config.json", JSON.stringify(config, null, 2) + "\n", "Atualizar configuracoes do site via admin");

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Erro ao salvar." });
  }
}
async function updateGithubFile(path, content, message) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    const error = new Error("Configuracao do servidor incompleta.");
    error.statusCode = 500;
    throw error;
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });

  if (!getRes.ok) {
    const error = new Error(`Erro ao ler ${path} no GitHub.`);
    error.statusCode = 500;
    throw error;
  }

  const { sha } = await getRes.json();
  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
      branch,
    }),
  });

  if (!putRes.ok) {
    const details = await putRes.json().catch(() => ({}));
    const error = new Error(details.message || `Erro ao salvar ${path} no GitHub.`);
    error.statusCode = putRes.status >= 400 && putRes.status < 500 ? 400 : 500;
    throw error;
  }
}
