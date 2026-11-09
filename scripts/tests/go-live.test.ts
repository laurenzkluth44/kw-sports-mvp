// Unit tests for the go-live checklist. Run: node --experimental-strip-types scripts/tests/go-live.test.ts
import { appChecks, emailChecks, findDomain, senderDomain, summary, supabaseAuthUrls } from "../../src/features/system/go-live.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };

assert(senderDomain("KW Sports <noreply@kwsports.de>") === "kwsports.de", "domain from display-name address");
assert(senderDomain("hello@Example.org") === "example.org", "domain from bare address");
assert(senderDomain(undefined) === "kwsports.de", "default sender domain");

const bare = { siteUrl: "https://kw-sports.vercel.app" };
const app = appChecks(bare);
assert(app.find((c) => c.id === "url")?.state === "info", "vercel address is fine but noted");
assert(app.find((c) => c.id === "service")?.state === "todo", "missing service role key is a todo");
assert(appChecks({ siteUrl: "http://localhost:3000" })[0].state === "todo", "localhost is a todo");

const none = emailChecks(bare, { kind: "no_key" }, []);
assert(summary(none).todo >= 4, "nothing configured: key, domain, notify, cron open");
assert(!JSON.stringify(none).includes("re_"), "no secret value in output");

const env = { ...bare, resendKey: "re_secret_123", cronSecret: "x".repeat(32), serviceRoleKey: "s" };
const ready = emailChecks(env, { kind: "domain", domain: "kwsports.de", status: "verified", records: [] }, ["kw@kwsports.de"]);
assert(summary(ready).ready, "verified domain + key + cron + recipient = ready");
assert(!JSON.stringify(ready).includes("re_secret_123"), "resend key never shown");

const pending = emailChecks(env, { kind: "domain", domain: "kwsports.de", status: "pending", records: [] }, ["kw@kwsports.de"]);
assert(pending.find((c) => c.id === "domain")?.state === "todo", "pending domain is a todo");
assert(emailChecks(env, { kind: "restricted" }, ["a@b.de"]).find((c) => c.id === "domain")?.state === "warn", "sending-only key: warn, not fail");
assert(emailChecks({ ...env, emailDisabled: "1" }, { kind: "no_key" }, [])[0].id === "disabled", "EMAIL_DISABLED shows first");

assert(findDomain([{ id: "1", name: "KWSports.de", status: "verified" }], "kwsports.de")?.id === "1", "domain match ignores case");
assert(supabaseAuthUrls("https://x.de").redirects.includes("https://x.de/auth/confirm"), "auth confirm url listed");
