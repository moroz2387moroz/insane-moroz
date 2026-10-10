const { createHash, randomBytes, timingSafeEqual } = require("node:crypto");

const sessions = new Map();
const sessionLifetime = 30 * 60 * 1000;
const hash = (value) => createHash("sha256").update(value).digest();

const getSessionId = (request) => request.headers.cookie
    ?.split("; ")
    .find((cookie) => cookie.startsWith("admin_session="))
    ?.slice("admin_session=".length);

const isAuthenticated = (request) => {
    const sessionId = getSessionId(request);
    const expiresAt = sessions.get(sessionId);

    if (expiresAt && expiresAt > Date.now()) {
        return true;
    }

    if (sessionId) {
        sessions.delete(sessionId);
    }
    return false;
};

module.exports = (request, response, next) => {
    if (request.path === "/auth/session") {
        if (request.method === "GET" && isAuthenticated(request)) {
            response.json({ authenticated: true });
            return;
        }

        response.set("Set-Cookie", "admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
        response.status(401).json({ authenticated: false });
        return;
    }

    if (request.path === "/users") {
        response.status(404).json({ message: "Not found" });
        return;
    }

    if (request.path === "/items" && request.method === "GET") {
        next();
        return;
    }

    if (request.path === "/auth/login") {
        if (request.method !== "GET") {
            response.set("Allow", "GET").status(405).json({ message: "Method not allowed" });
            return;
        }

        const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
            response.status(503).json({ message: "Authentication is not configured" });
            return;
        }

        const { login, password } = request.query;
        const loginMatches = timingSafeEqual(hash(String(login || "")), hash(ADMIN_USERNAME));
        const passwordMatches = timingSafeEqual(hash(String(password || "")), hash(ADMIN_PASSWORD));

        if (!loginMatches || !passwordMatches) {
            response.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const sessionId = randomBytes(32).toString("hex");
        sessions.set(sessionId, Date.now() + sessionLifetime);
        response
            .set("Set-Cookie", `admin_session=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetime / 1000}`)
            .status(200)
            .json({ authenticated: true });
        return;
    }

    if (!isAuthenticated(request)) {
        response.status(401).json({ message: "Authentication required" });
        return;
    }
    next();
};
