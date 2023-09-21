import bodyParser from "body-parser";
import * as crypto from "crypto";
import "dotenv/config";
import express from "express";
import { verbose } from "sqlite3";
const sqlite3 = verbose();

const db = new sqlite3.Database("players.db");
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='players'", (err, row) => {
	if (err) throw err;
	if (!row) db.run("CREATE TABLE players (id integer PRIMARY KEY AUTOINCREMENT, username varchar(255) NOT NULL, password char(16) NOT NULL, access_token char(128), games_played int DEFAULT 0, kills int DEFAULT 0, currency int DEFAULT 0)");
});

const app = express();

const defaultHeaders = {
	"X-XSS-Protection": "1; mode=block",
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "same-origin"
};

app.get("/", (_req, res) => {
	for (const [key, value] of Object.entries(defaultHeaders))
		res.setHeader(key, value);
	res.sendFile("index.html", { root: "client" });
});
app.get("/loadout", (_req, res) => {
	for (const [key, value] of Object.entries(defaultHeaders))
		res.setHeader(key, value);
	res.sendFile("loadout.html", { root: "client" });
});

app.get("/discord", (_req, res) => {
	res.redirect(308, "https://discord.gg/jKQEVT7Vd3");
});

// API endpoints
const jsonParser = bodyParser.json();
// Generate a new access token when this endpoint is called
app.post("/api/login", jsonParser, (req, res) => {
	if (!req.body?.username || !req.body.password) return res.status(400).json({ success: false, error: "No username or password provided" });
	// Re-hashing password
	const hashed = crypto.createHash("sha1").update(req.body.password).digest("hex").slice(0, 16);
	db.get("SELECT id FROM players WHERE username = ? AND password = ?", [req.body.username, hashed], function (err, row?: { id: number }) {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false, error: "Server database failed" });
		}
		if (!row) return res.status(403).json({ success: false, error: "No user found" });
		const accessToken = crypto.createHash("sha512").update(`${req.body.username}${hashed}${crypto.randomUUID()}`).digest("hex");
		db.run("UPDATE players SET access_token = ? WHERE id = ?", [accessToken, row.id]);
		res.json({ success: true, accessToken });
	});
});
// Create a new sign up
app.post("/api/signup", jsonParser, (req, res) => {
	if (!req.body?.username || !req.body.password) return res.status(400).json({ success: false, error: "No username or password provided" });
	// Password should be SHA1-hashed and trimmed to 16 characters
	if (req.body.password.length != 16) return res.status(400).json({ success: false, error: "Password hash is invalid" });
	// Re-hashing password
	const hashed = crypto.createHash("sha1").update(req.body.password).digest("hex").slice(0, 16);
	const accessToken = crypto.createHash("sha512").update(`${req.body.username}${hashed}${crypto.randomUUID()}`).digest("hex");
	db.run("INSERT INTO players (username, password, access_token) VALUES (?, ?, ?)", [req.body.username, hashed, accessToken], err => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false, error: "Server database failed" });
		}
		console.log("Account creation:", req.body.username);
		res.json({ success: true, accessToken });
	});
});
// Validate access token
app.post("/api/validate", jsonParser, (req, res) => {
	if (!req.body?.username || !req.body.accessToken) return res.status(400).json({ success: false, error: "No username or access token provided" });
	db.get("SELECT id FROM players WHERE username = ? AND access_token = ?", [req.body.username, req.body.accessToken], (err, row) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false, error: "Server database failed" });
		}
		if (!row) return res.status(403).json({ success: false, error: "No user found" });
		res.json({ success: true });
	});
});
// Get player currency
app.get("/api/currency", (req, res) => {
	if (!req.headers.authorization?.startsWith("Bearer")) return res.status(400).json({ success: false, error: "No access token provided" });
	const token = req.headers.authorization.split(" ")[1];
	db.get("SELECT currency FROM players WHERE access_token = ?", token, (err, row?: { currency: number }) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false, error: "Server database failed" });
		}
		if (!row) return res.status(403).json({ success: false, error: "No user found" });
		res.json({ success: true, currency: row.currency });
	});
});
// Add currency to player
app.post("/api/delta-currency", jsonParser, (req, res) => {
	var respond = req.headers.authorization
	if (!respond?.startsWith("Bearer")) return res.status(400).json({ success: false, error: "No server access token provided" });
	if (!req.body?.accessToken || !req.body.delta) return res.status(400).json({ success: false, error: "No delta or access token provided" });
	if (typeof req.body.delta !== "number") return res.status(400).json({ success: false, error: "Data type of delta is invalid" });
	const token = respond.split(" ")[1];
	if (token !== process.env.SERVER_DB_TOKEN) return res.status(403).json({ success: false, error: "Unauthorized server access token" });
	db.get("SELECT currency FROM players WHERE access_token = ?", req.body.accessToken, (err, row?: { currency: number }) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ success: false, error: "Server database failed" });
		}
		if (!row) return res.status(403).json({ success: false, error: "No user found" });
		db.run("UPDATE players SET currency = ? WHERE access_token = ?", [row.currency + req.body.delta, req.body.accessToken], err => {

			if (err) {
				console.error(err);
				return res.status(500).json({ success: false, error: "Server database failed" });
			}
			res.json({ success: true, currency: row.currency + req.body.delta });
		});
	});
});

app.use("/data", express.static("data", { dotfiles: "allow", fallthrough: false }));
app.use("/assets", express.static("client/assets", { fallthrough: false }));
app.use("/scripts", express.static("client/scripts", { fallthrough: false }));
app.use(express.static("client/public", { fallthrough: false }));

app.use((_req, res) => {
	res.status(404);
});

const server = app.listen(process.env.PORT || 8000, async () => {
	const info = <any>server.address();
	const port = info.port;
	console.log('Islandr webserver listening at port %s', port);
});