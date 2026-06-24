import crypto from "node:crypto";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const attempts = globalThis.__motorlifeAdminAttempts || new Map();
globalThis.__motorlifeAdminAttempts = attempts;

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}
function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function readAttempts(ip) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || now - current.firstAt > WINDOW_MS) {
    const fresh = { count: 0, firstAt: now };
    attempts.set(ip, fresh);
    return fresh;
  }
  return current;
}

export function assertLoginAllowed(req) {
  const ip = getClientIp(req);
  const current = readAttempts(ip);
  if (current.count >= MAX_ATTEMPTS) {
    const error = new Error("Muitas tentativas. Aguarde alguns minutos.");
    error.statusCode = 429;
    throw error;
  }
  return ip;
}

export function registerLoginFailure(ip) {
  const current = readAttempts(ip);
  current.count += 1;
  attempts.set(ip, current);
}

export function clearLoginFailures(ip) {
  attempts.delete(ip);
}

export function verifyPassword(password) {
  const raw = String(password || "");

  if (process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_SALT) {
    const candidate = crypto.scryptSync(raw, process.env.ADMIN_PASSWORD_SALT, 32).toString("hex");
    return safeEqual(candidate, process.env.ADMIN_PASSWORD_HASH);
  }

  if (process.env.ADMIN_PASSWORD) {
    return safeEqual(raw, process.env.ADMIN_PASSWORD);
  }

  if (process.env.ADMIN_PIN) {
    return safeEqual(raw, process.env.ADMIN_PIN);
  }

  return false;
}

export function createSessionToken() {
  const secret = getSessionSecret();
  const payload = base64url(JSON.stringify({
    sub: "motorlife-admin",
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return false;

  const expected = sign(payload, getSessionSecret());
  if (!safeEqual(signature, expected)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.sub === "motorlife-admin" && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN;
  if (!secret) {
    const error = new Error("Credenciais de admin nao configuradas.");
    error.statusCode = 500;
    throw error;
  }
  return secret;
}

export function normalizeConfig(config) {
  const whatsappNumber = String(config?.whatsappNumber || "")
    .replace(/\D/g, "")
    .slice(0, 20);
  const instagramUrl = String(config?.instagramUrl || "https://instagram.com/motorlife_rs").trim();

  if (whatsappNumber.length < 10) {
    const error = new Error("Numero de WhatsApp invalido.");
    error.statusCode = 400;
    throw error;
  }

  return { whatsappNumber, instagramUrl };
}

export function normalizeCatalog(catalog) {
  if (!Array.isArray(catalog) || !catalog.length) {
    const error = new Error("Catalogo invalido.");
    error.statusCode = 400;
    throw error;
  }

  if (JSON.stringify(catalog).length > 4_500_000) {
    const error = new Error("Catalogo muito grande. Reduza o tamanho das imagens.");
    error.statusCode = 400;
    throw error;
  }

  return catalog.map((vehicle, index) => {
    const id = String(vehicle.id || `motorhome-${index + 1}`).replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    const images = Array.isArray(vehicle.images) ? vehicle.images : [];
    const features = Array.isArray(vehicle.features) ? vehicle.features : [];

    return {
      id,
      name: String(vehicle.name || "Motorhome").trim(),
      price: Number(vehicle.price) || 0,
      model: String(vehicle.model || "Modelo do veiculo").trim(),
      passengers: Number(vehicle.passengers) || 1,
      license: String(vehicle.license || "CNH B").trim(),
      petFriendly: vehicle.petFriendly !== false,
      travel: String(vehicle.travel || "Viagens nacionais e internacionais").trim(),
      images: images.map((image) => String(image || "").trim()).filter(Boolean),
      profile: String(vehicle.profile || "").trim(),
      features: features.map((feature) => String(feature || "").trim()).filter(Boolean),
    };
  });
}

