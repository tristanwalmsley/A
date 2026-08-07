/* ══════════════════════════════════════════════════════════
   login gate + GitHub-backed storage
   Include this ONE file on every page, as the very FIRST
   script in <head>, before any other script (including nav.js).

   What it does:
   1. Shows a "Tristan / Ann" picker + password gate
      the first time on a device (remembered after that).
   2. Pulls that person's saved data down from GitHub and loads
      it into localStorage BEFORE the rest of the page runs.
   3. From then on, any localStorage.setItem/removeItem anywhere
      on the site is mirrored up
      to GitHub automatically, debounced by 3s.
   ══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── 1. CONFIG — fill these in ──────────────────────────────
  const CONFIG = {
    owner: "tristanwalmsley",
    repo: "A",
    branch: "main",
    dataPath: "data",
    // Fine-grained PAT, scoped ONLY to this repo, Contents: Read & write.
    // github.com/settings/tokens -> Fine-grained tokens -> Generate new token
    token: "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",
    password: "beans"
  };
  // ────────────────────────────────────────────────────────────

  const USER_KEY = "bestie_current_user";
  const API_BASE = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.dataPath}`;

  let currentUser = null;
  let syncing = false;
  let pendingTimer = null;
  let fileSha = null; // needed by GitHub API to update an existing file

  // Keys we never want to ship to GitHub (device-local only)
  const LOCAL_ONLY_KEYS = new Set([USER_KEY]);

  function snapshotLocalStorage() {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (LOCAL_ONLY_KEYS.has(k)) continue;
      out[k] = localStorage.getItem(k);
    }
    return out;
  }

  function applySnapshotToLocalStorage(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return;
    Object.keys(snapshot).forEach((k) => {
      if (LOCAL_ONLY_KEYS.has(k)) return;
      localStorage.setItem(k, snapshot[k]);
    });
  }

  function b64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64DecodeUnicode(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  async function fetchRemoteData(user) {
    try {
      const res = await fetch(`${API_BASE}/${user}.json?ref=${CONFIG.branch}`, {
        headers: { Authorization: `Bearer ${CONFIG.token}` }
      });
      if (res.status === 404) {
        fileSha = null;
        return {}; // no file yet — first ever sync for this person
      }
      if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
      const json = await res.json();
      fileSha = json.sha;
      const content = b64DecodeUnicode(json.content.replace(/\n/g, ""));
      return JSON.parse(content);
    } catch (err) {
      console.warn("[bestie-sync] fetch failed, continuing offline:", err);
      return null; // null = "couldn't reach GitHub", not "empty"
    }
  }

  async function pushRemoteData(user) {
    if (!currentUser) return;
    syncing = true;
    try {
      const snapshot = snapshotLocalStorage();
      const content = b64EncodeUnicode(JSON.stringify(snapshot, null, 2));
      const body = {
        message: `sync: ${user} — ${new Date().toISOString()}`,
        content,
        branch: CONFIG.branch
      };
      if (fileSha) body.sha = fileSha;

      const res = await fetch(`${API_BASE}/${user}.json`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${CONFIG.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`GitHub PUT failed: ${res.status} ${errText}`);
      }
      const json = await res.json();
      fileSha = json.content.sha; // keep sha fresh for next write
    } catch (err) {
      console.warn("[bestie-sync] push failed:", err);
    } finally {
      syncing = false;
    }
  }

  function scheduleSync() {
    if (!currentUser) return;
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => pushRemoteData(currentUser), 3000);
  }

  function patchLocalStorage() {
    const origSet = localStorage.setItem.bind(localStorage);
    const origRemove = localStorage.removeItem.bind(localStorage);
    const origClear = localStorage.clear.bind(localStorage);

    localStorage.setItem = function (k, v) {
      origSet(k, v);
      if (!LOCAL_ONLY_KEYS.has(k)) scheduleSync();
    };
    localStorage.removeItem = function (k) {
      origRemove(k);
      if (!LOCAL_ONLY_KEYS.has(k)) scheduleSync();
    };
    localStorage.clear = function () {
      origClear();
      scheduleSync();
    };
  }

  // ── Login gate UI ───────────────────────────────────────────
  function buildGate(onDone) {
    // Pull in the same fonts the rest of the site uses
    if (!document.getElementById("bestie-gate-fonts")) {
      const link = document.createElement("link");
      link.id = "bestie-gate-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Caveat:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;1,400&display=swap";
      document.head.appendChild(link);
    }

    const style = document.createElement("style");
    style.textContent = `
      #bestie-gate{position:fixed;inset:0;z-index:99999;
        display:flex;align-items:center;justify-content:center;
        font-family:'EB Garamond',Georgia,serif;
        background:
          radial-gradient(ellipse 60% 45% at 20% 15%, rgba(200,148,58,0.16), transparent 60%),
          radial-gradient(ellipse 55% 40% at 85% 20%, rgba(184,104,88,0.14), transparent 60%),
          radial-gradient(ellipse 60% 50% at 50% 100%, rgba(122,152,112,0.14), transparent 60%),
          linear-gradient(160deg, #faf4e8 0%, #f0ddb8 55%, #f5e6c8 100%);
        animation:bg-fade-in 0.5s ease both}
      #bestie-gate::after{content:'';position:absolute;inset:0;pointer-events:none;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")}
      @keyframes bg-fade-in{from{opacity:0}to{opacity:1}}
      @keyframes bg-card-in{from{opacity:0;transform:translateY(14px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}

      #bestie-gate .bg-card{position:relative;background:#fffdf5;border:1px solid #d4b483;
        box-shadow:6px 6px 0 #f0ddb8, 0 20px 50px -20px rgba(58,32,16,0.35);
        padding:2.6rem 2.8rem 2.2rem;max-width:380px;width:90vw;text-align:center;
        animation:bg-card-in 0.55s cubic-bezier(0.22,1,0.36,1) both;animation-delay:0.1s}

      #bestie-gate .bg-eyebrow{font-family:'Caveat',cursive;font-size:1rem;color:#c8943a;
        letter-spacing:0.5px;margin-bottom:0.3rem}
      #bestie-gate .bg-title{font-family:'Playfair Display',serif;font-style:italic;
        font-size:1.7rem;color:#3a2010;margin-bottom:0.3rem}
      #bestie-gate .bg-sub{font-family:'Caveat',cursive;font-size:1rem;color:#7a5230;
        margin-bottom:1.5rem;letter-spacing:0.3px}

      #bestie-gate .bg-rule{display:flex;align-items:center;gap:0.8rem;margin:0 0 1.6rem}
      #bestie-gate .bg-rule-line{flex:1;height:1px;background:#d4b483}
      #bestie-gate .bg-rule-diamond{color:#c8943a;font-size:0.85rem}

      #bestie-gate .bg-choices{display:flex;gap:0.9rem;justify-content:center}
      #bestie-gate button.bg-person{flex:1;padding:0.9rem 0.6rem;font-family:'Playfair Display',serif;
        font-style:italic;font-size:1.1rem;border:1px solid #7a5230;background:#faf4e8;
        color:#3a2010;cursor:pointer;box-shadow:3px 3px 0 #e8d4a8;
        transition:transform 0.15s ease,box-shadow 0.15s ease,background 0.15s ease}
      #bestie-gate button.bg-person:hover{background:#f0ddb8;transform:translate(-1px,-1px);
        box-shadow:4px 4px 0 #d4b483}
      #bestie-gate button.bg-person:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #d4b483}
      #bestie-gate button.bg-person.bg-chosen{background:#7a9870;border-color:#7a9870;color:#fffdf5;
        box-shadow:3px 3px 0 #5f7a58}

      #bestie-gate .bg-pw{display:none;flex-direction:column;align-items:center;gap:0.8rem;
        margin-top:1.5rem;animation:bg-card-in 0.4s cubic-bezier(0.22,1,0.36,1) both}
      #bestie-gate .bg-pw-label{font-family:'Caveat',cursive;font-size:0.95rem;color:#7a5230}
      #bestie-gate .bg-pw input{padding:0.6rem 0.9rem;border:1px solid #7a5230;background:#fffdf5;
        font-family:'EB Garamond',Georgia,serif;font-size:1.05rem;text-align:center;
        width:70%;letter-spacing:2px;outline:none;transition:border-color 0.15s}
      #bestie-gate .bg-pw input:focus{border-color:#c8943a}
      #bestie-gate .bg-pw button.bg-submit{padding:0.55rem 1.6rem;cursor:pointer;
        font-family:'Caveat',cursive;font-size:1.05rem;font-weight:700;letter-spacing:0.5px;
        border:1px solid #7a5230;background:#3a2010;color:#faf4e8;
        box-shadow:3px 3px 0 #c8943a;transition:transform 0.15s ease}
      #bestie-gate .bg-pw button.bg-submit:hover{transform:translate(-1px,-1px)}
      #bestie-gate .bg-err{color:#b86858;font-family:'Caveat',cursive;font-size:0.95rem;
        min-height:1.2em}
      #bestie-gate .bg-shake{animation:bg-shake 0.4s}
      @keyframes bg-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}

      body.bg-locked{overflow:hidden}
      body.bg-locked > *:not(#bestie-gate){display:none !important}
    `;
    document.head.appendChild(style);

    const gate = document.createElement("div");
    gate.id = "bestie-gate";
    gate.innerHTML = `
      <div class="bg-card">
        <div class="bg-eyebrow">✦ Bestie Affairs — Access Required ✦</div>
        <div class="bg-title">Who's reading this?</div>
        <div class="bg-sub">pick yourself, then the secret word</div>
        <div class="bg-rule"><div class="bg-rule-line"></div><div class="bg-rule-diamond">✦</div><div class="bg-rule-line"></div></div>
        <div class="bg-choices">
          <button class="bg-person" data-user="tristan">Tristan</button>
          <button class="bg-person" data-user="ann">Ann</button>
        </div>
        <div class="bg-pw">
          <div class="bg-pw-label">and the password is...</div>
          <input type="password" class="bg-input" placeholder="•••••" autocomplete="off" />
          <button class="bg-submit">Enter ✦</button>
          <div class="bg-err"></div>
        </div>
      </div>
    `;
    document.body.classList.add("bg-locked");
    document.body.appendChild(gate);

    let chosen = null;
    const card = gate.querySelector(".bg-card");
    const pwBox = gate.querySelector(".bg-pw");
    const input = gate.querySelector(".bg-input");
    const err = gate.querySelector(".bg-err");
    const personBtns = gate.querySelectorAll(".bg-person");

    personBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        chosen = btn.dataset.user;
        personBtns.forEach((b) => b.classList.toggle("bg-chosen", b === btn));
        pwBox.style.display = "flex";
        input.focus();
      });
    });

    function trySubmit() {
      if (input.value === CONFIG.password) {
        card.style.animation = "bg-card-in 0.3s ease reverse both";
        gate.style.animation = "bg-fade-in 0.35s ease reverse both";
        setTimeout(() => {
          gate.remove();
          style.remove();
          document.body.classList.remove("bg-locked");
          onDone(chosen);
        }, 280);
      } else {
        err.textContent = "nope, try again ✦";
        input.value = "";
        card.classList.remove("bg-shake");
        void card.offsetWidth; // restart animation
        card.classList.add("bg-shake");
      }
    }
    gate.querySelector(".bg-submit").addEventListener("click", trySubmit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") trySubmit();
    });
  }

  // ── Boot sequence ───────────────────────────────────────────
  async function boot(user) {
    currentUser = user;
    localStorage.setItem(USER_KEY, user);
    const remote = await fetchRemoteData(user);
    if (remote) applySnapshotToLocalStorage(remote);
    patchLocalStorage();
    document.dispatchEvent(new CustomEvent("bestie-sync-ready", { detail: { user } }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved === "tristan" || saved === "ann") {
      boot(saved);
    } else {
      document.body.classList.add("bg-locked");
      buildGate(boot);
    }
  });

  // Expose a manual "switch user" for a logout-style button if you want one later
  window.BestieSync = {
    switchUser() {
      localStorage.removeItem(USER_KEY);
      location.reload();
    },
    isSyncing: () => syncing
  };
})();
