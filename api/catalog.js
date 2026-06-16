export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { pin, catalog } = req.body ?? {};

  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "PIN inválido" });
  }

  if (!Array.isArray(catalog) || !catalog.length) {
    return res.status(400).json({ error: "Catálogo inválido" });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return res.status(500).json({ error: "Configuração do servidor incompleta" });
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/catalog.json`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const getRes = await fetch(`${apiBase}?ref=main`, { headers });

  if (!getRes.ok) {
    return res.status(500).json({ error: "Erro ao ler catálogo atual no GitHub" });
  }

  const { sha } = await getRes.json();
  const content = Buffer.from(JSON.stringify(catalog, null, 2) + "\n").toString("base64");

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Atualizar catálogo via admin",
      content,
      sha,
      branch: "main",
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    return res.status(500).json({ error: err.message || "Erro ao salvar no GitHub" });
  }

  return res.status(200).json({ ok: true });
}
