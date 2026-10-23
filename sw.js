/* Kedim's Snack Swing service worker, scope /kedim-snack-swing/ only (keeps the hub's "/" worker off this game).
   Network-first for the game page (fresh builds win online, cached copy offline); cache-first for own icons. */
const C = "kedim-snack-swing-v17";
self.addEventListener("install", (e) => { e.waitUntil(Promise.race([new Promise((ok) => setTimeout(ok, 10000)), caches.open(C).then((c) => c.addAll(["./", "manifest.webmanifest", "icons/icon-192.png"])).catch(() => {})]).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("kedim-snack-swing-") && k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith("/kedim-snack-swing/")) return;
  if (r.mode === "navigate") {
    // network-first with a 3s timeout: a stalled network shows the cached game instead of hanging on the splash
    const net = fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put("./", cp)).catch(() => {}); } return res; });
    const late = (ms) => new Promise((ok) => setTimeout(ok, ms));
    e.respondWith(Promise.race([net, late(3000).then(() => caches.match("./").then((h) => h || net))])
      .catch(() => caches.match("./").then((h) => h || Response.error())));
  } else if (u.pathname.startsWith("/kedim-snack-swing/icons/") || u.pathname === "/kedim-snack-swing/manifest.webmanifest") {
    e.respondWith(caches.match(r).then((h) => h || fetch(r)));
  }
});
