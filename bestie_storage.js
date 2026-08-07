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
    const style = document.createElement("style");
    style.textContent = `
      #bestie-gate{position:fixed;inset:0;background:#faf4e8;z-index:99999;
        display:flex;align-items:center;justify-content:center;flex-direction:column;
        font-family:Georgia,serif;gap:1.2rem}
      #bestie-gate .bg-title{font-size:1.4rem;color:#3a2010}
      #bestie-gate .bg-choices{display:flex;gap:1rem}
      #bestie-gate button.bg-person{padding:0.8rem 1.6rem;font-size:1.05rem;
        border:1px solid #7a5230;background:#fffdf5;color:#3a2010;cursor:pointer;
        border-radius:2px}
      #bestie-gate button.bg-person:hover{background:#f0ddb8}
      #bestie-gate .bg-pw{display:none;flex-direction:column;align-items:center;gap:0.6rem}
      #bestie-gate .bg-pw input{padding:0.5rem 0.8rem;border:1px solid #7a5230;
        font-size:1rem;text-align:center}
      #bestie-gate .bg-pw button{padding:0.5rem 1.2rem;cursor:pointer}
      #bestie-gate .bg-err{color:#b86858;font-size:0.85rem;min-height:1.1em}
      body.bg-locked > *:not(#bestie-gate){display:none !important}
    `;
    document.head.appendChild(style);

    const gate = document.createElement("div");
    gate.id = "bestie-gate";
    gate.innerHTML = `
      <div class="bg-title">who's this?</div>
      <div class="bg-choices">
        <button class="bg-person" data-user="tristan">Tristan</button>
        <button class="bg-person" data-user="ann">Ann</button>
      </div>
      <div class="bg-pw">
        <input type="password" class="bg-input" placeholder="password" autocomplete="off" />
        <button class="bg-submit">Enter</button>
        <div class="bg-err"></div>
      </div>
    `;
    document.body.classList.add("bg-locked");
    document.body.appendChild(gate);

    let chosen = null;
    const pwBox = gate.querySelector(".bg-pw");
    const input = gate.querySelector(".bg-input");
    const err = gate.querySelector(".bg-err");

    gate.querySelectorAll(".bg-person").forEach((btn) => {
      btn.addEventListener("click", () => {
        chosen = btn.dataset.user;
        pwBox.style.display = "flex";
        input.focus();
      });
    });

    function trySubmit() {
      if (input.value === CONFIG.password) {
        gate.remove();
        style.remove();
        document.body.classList.remove("bg-locked");
        onDone(chosen);
      } else {
        err.textContent = "nope, try again";
        input.value = "";
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
