"use client";
// ↑ Required by Next.js — tells the framework this component runs in the browser,
//   not on the server, so we can use React hooks like useState.

// Import useState — the core React hook for managing data that changes over time.
// When state changes, React automatically re-renders the affected parts of the UI.
import { useState } from "react";

// ============================================================
// SECTION 1 — CANDIDATE DATA
// ─────────────────────────────────────────────────────────────
// This array acts as our in-memory "database".
// In a real blockchain app, this data would be fetched from
// a deployed Solidity smart contract using ethers.js or web3.js.
// ============================================================
const CANDIDATES = [
  {
    id: 1,
    name: "Alice Johnson",
    party: "Green Future Party",
    description:
      "Advocating for sustainable energy, environmental reform, and a greener tomorrow for every citizen.",
    emoji: "🌿",
    accentColor: "#22c55e",
    votes: 0,
  },
  {
    id: 2,
    name: "Michael Lee",
    party: "Digital Progress Party",
    description:
      "Championing tech innovation, digital infrastructure, and bringing blockchain transparency to governance.",
    emoji: "💡",
    accentColor: "#3b82f6",
    votes: 0,
  },
  {
    id: 3,
    name: "Sarah Ahmed",
    party: "People First Alliance",
    description:
      "Fighting for education, healthcare equity, and community-driven policies that put people before profit.",
    emoji: "🤝",
    accentColor: "#a78bfa",
    votes: 0,
  },
];

// ============================================================
// SECTION 2 — HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────
// generateFakeAddress() mimics a real Ethereum address:
//   "0x" + 40 random hex characters = 42 chars total.
// shortenAddress() trims it for display: 0x3f9a1b…d4e5
// ============================================================
function generateFakeAddress() {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += hex[Math.floor(Math.random() * hex.length)];
  }
  return addr;
}

function shortenAddress(addr) {
  return addr.slice(0, 8) + "…" + addr.slice(-4);
}

// ============================================================
// SECTION 3 — MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
// React components are just functions that return JSX.
// Next.js renders this component at the "/" route automatically.
// ============================================================
export default function Home() {

  // ── STATE VARIABLES ──────────────────────────────────────
  // useState(initialValue) returns [value, setValue].
  // Calling setValue() triggers a re-render with the new value.

  // The live candidate list with vote counts
  const [candidates, setCandidates] = useState(CANDIDATES);

  // Whether a wallet is "connected" (UI simulation — no real Web3)
  const [walletConnected, setWalletConnected] = useState(false);

  // The fake Ethereum address displayed after connecting
  const [walletAddress, setWalletAddress] = useState("");

  // Which candidate the user voted for (null = not voted yet)
  const [votedFor, setVotedFor] = useState(null);

  // Two-phase transaction status:
  //   null          → nothing happening
  //   "processing"  → show spinner + "Processing transaction…"
  //   "confirmed"   → show tick  + "Transaction confirmed!"
  const [txStatus, setTxStatus] = useState(null);

  // Toast notification: { message, type }  where type is "success"|"warning"|"info"
  const [toast, setToast] = useState(null);

  // ── HELPER: SHOW TOAST ───────────────────────────────────
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── HANDLER: CONNECT / DISCONNECT WALLET ─────────────────
  const handleConnectWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress("");
      showToast("Wallet disconnected.", "info");
    } else {
      const addr = generateFakeAddress();
      setWalletConnected(true);
      setWalletAddress(addr);
      showToast("✅ Wallet connected successfully!", "success");
    }
  };

  // ── HANDLER: CAST VOTE ────────────────────────────────────
  // Simulates the 2-step blockchain flow:
  //   Phase 1 (1.8 s) → "Processing transaction…"
  //   Phase 2 (1.2 s) → "Transaction confirmed!" then dismiss
  const handleVote = (candidateId) => {
    if (!walletConnected) {
      showToast("⚠️ Please connect your wallet to vote.", "warning");
      return;
    }
    if (votedFor !== null) {
      showToast("⚠️ You have already cast your vote this session.", "warning");
      return;
    }

    // Phase 1
    setTxStatus("processing");

    setTimeout(() => {
      // Phase 2 — update state and show confirmation
      setTxStatus("confirmed");

      // Immutable state update: .map() returns a new array
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
        )
      );
      setVotedFor(candidateId);

      const chosen = CANDIDATES.find((c) => c.id === candidateId);
      showToast("🗳️ Vote for " + chosen.name + " recorded on-chain!", "success");

      // Clear overlay after showing "confirmed"
      setTimeout(() => setTxStatus(null), 1200);
    }, 1800);
  };

  // ── DERIVED VALUES ───────────────────────────────────────
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  // ============================================================
  // SECTION 4 — RENDER (JSX)
  // ─────────────────────────────────────────────────────────────
  // JSX looks like HTML but compiles to JavaScript.
  // Curly braces {} embed JavaScript expressions inline.
  // ============================================================
  return (
    <div className="page">

      {/* ════════════════════════════════════════
          TOAST NOTIFICATION
          Conditionally rendered — only visible when toast != null
      ════════════════════════════════════════ */}
      {toast && (
        <div className={"toast toast--" + toast.type}>
          {toast.message}
        </div>
      )}

      {/* ════════════════════════════════════════
          TRANSACTION OVERLAY
          Fullscreen modal — two visual phases
      ════════════════════════════════════════ */}
      {txStatus && (
        <div className="tx-overlay">
          <div className="tx-modal">
            {txStatus === "processing" ? (
              <>
                <div className="tx-spinner" />
                <p className="tx-phase">Processing transaction…</p>
                <p className="tx-sub">Broadcasting to the Ethereum network</p>
              </>
            ) : (
              <>
                <div className="tx-check">✅</div>
                <p className="tx-phase tx-phase--ok">Transaction confirmed!</p>
                <p className="tx-sub">Your vote has been recorded on-chain</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          HEADER — sticky, with wallet connect
      ════════════════════════════════════════ */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">⛓️</span>
            <div>
              <h1 className="brand-name">Blockchain Voting App</h1>
              <p className="brand-tagline">Decentralised · Transparent · Tamper-Proof</p>
            </div>
          </div>

          <button
            onClick={handleConnectWallet}
            className={"wallet-btn" + (walletConnected ? " wallet-btn--on" : "")}
            title={walletConnected ? "Click to disconnect" : "Click to connect wallet"}
          >
            {walletConnected ? (
              <>
                <span className="wallet-dot" />
                <span>Connected: {shortenAddress(walletAddress)}</span>
              </>
            ) : (
              "🔗 Connect Wallet"
            )}
          </button>
        </div>

        {/* Full address bar shown beneath header when connected */}
        {walletConnected && (
          <div className="wallet-bar">
            <span className="wallet-bar-label">Connected Wallet</span>
            <span className="wallet-bar-addr">{walletAddress}</span>
            <span className="wallet-bar-net">Ethereum Testnet (Demo)</span>
          </div>
        )}
      </header>

      <main className="main">

        {/* ════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════ */}
        <section className="hero">
          <h2 className="hero-title">Cast Your Vote</h2>
          <p className="hero-desc">
            Every ballot is cryptographically signed, permanently stored on-chain,
            and publicly verifiable. One wallet address = one vote.
          </p>
          {!walletConnected && (
            <p className="hero-hint hero-hint--warn">
              ⚠️ Connect your wallet above before voting.
            </p>
          )}
          {votedFor && (
            <p className="hero-hint hero-hint--ok">
              🗳️ You voted for <strong>{candidates.find((c) => c.id === votedFor)?.name}</strong>. Thank you for participating!
            </p>
          )}
        </section>

        {/* ════════════════════════════════════════
            CANDIDATES SECTION
            .map() renders one card per candidate
        ════════════════════════════════════════ */}
        <section className="section">
          <h2 className="section-title">Candidates</h2>
          <div className="cards-grid">
            {candidates.map((c) => {
              const isMyVote = votedFor === c.id;
              const hasVoted = votedFor !== null;
              const canVote  = walletConnected && !hasVoted && !txStatus;

              return (
                <div
                  key={c.id}
                  className={"card" + (isMyVote ? " card--voted" : "")}
                  style={isMyVote ? { borderColor: c.accentColor, boxShadow: "0 0 28px " + c.accentColor + "33" } : {}}
                >
                  {/* "Your Vote" ribbon */}
                  {isMyVote && (
                    <div className="card-ribbon" style={{ background: c.accentColor }}>
                      Your Vote ✓
                    </div>
                  )}

                  {/* Emoji avatar */}
                  <div className="card-avatar" style={{ borderColor: c.accentColor }}>
                    {c.emoji}
                  </div>

                  {/* Candidate info */}
                  <div className="card-body">
                    <h3 className="card-name">{c.name}</h3>
                    <p className="card-party" style={{ color: c.accentColor }}>{c.party}</p>
                    <p className="card-desc">{c.description}</p>
                  </div>

                  {/* Live vote count */}
                  <div className="vote-badge">
                    <span className="vote-num" style={{ color: c.accentColor }}>{c.votes}</span>
                    <span className="vote-lbl">votes</span>
                  </div>

                  {/* Vote button — three possible states */}
                  <button
                    onClick={() => handleVote(c.id)}
                    disabled={!canVote}
                    className={
                      "vote-btn" +
                      (isMyVote ? " vote-btn--done" : "") +
                      (!walletConnected ? " vote-btn--locked" : "") +
                      (hasVoted && !isMyVote ? " vote-btn--ghost" : "")
                    }
                    style={canVote ? { background: "linear-gradient(135deg, " + c.accentColor + "bb, " + c.accentColor + ")" } : {}}
                  >
                    {isMyVote ? "✅ Voted!" : !walletConnected ? "🔒 Connect Wallet" : "🗳️ Vote"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════
            LIVE RESULTS SECTION
            Sorted by votes. Animated progress bars.
        ════════════════════════════════════════ */}
        <section className="section results-panel">
          <h2 className="section-title">Live Results</h2>
          <div className="results-meta">
            <span>Total votes recorded on-chain:</span>
            <strong className="results-total-num">{totalVotes}</strong>
          </div>
          <div className="results-list">
            {sortedCandidates.map((c, index) => {
              // Calculate percentage — avoid divide-by-zero when totalVotes is 0
              const pct = totalVotes === 0 ? 0 : Math.round((c.votes / totalVotes) * 100);
              const isLeading = index === 0 && totalVotes > 0;

              return (
                <div key={c.id} className="result-row">
                  <span className="result-rank" style={isLeading ? { color: "#fbbf24" } : {}}>
                    {isLeading ? "🥇" : "#" + (index + 1)}
                  </span>
                  <span className="result-emoji">{c.emoji}</span>
                  <div className="result-info">
                    <div className="result-meta-row">
                      <span className="result-name">{c.name}</span>
                      <span className="result-pct" style={{ color: c.accentColor }}>{pct}%</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: pct + "%",
                          background: "linear-gradient(90deg, " + c.accentColor + "88, " + c.accentColor + ")",
                        }}
                      />
                    </div>
                  </div>
                  <span className="result-count">{c.votes} votes</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════
            HOW BLOCKCHAIN VOTING WORKS
            Key concepts for the coursework presentation.
        ════════════════════════════════════════ */}
        <section className="section">
          <h2 className="section-title">How Blockchain Voting Works</h2>
          <div className="info-grid">
            {[
              {
                icon: "🔑",
                title: "One Wallet = One Vote",
                body: "Each Ethereum wallet address is unique. The Solidity smart contract stores a mapping of address → hasVoted, so a second vote attempt from the same address is automatically rejected by the contract — no manual checks needed.",
              },
              {
                icon: "📜",
                title: "Smart Contract Enforces the Rules",
                body: "All voting logic lives inside a Solidity contract deployed on-chain. No administrator can override it after deployment. The rules are public, auditable code — not a policy document anyone can ignore.",
              },
              {
                icon: "🔎",
                title: "Votes Are Transparent",
                body: "Every vote is a blockchain transaction visible to anyone via a block explorer like Etherscan. This makes results independently verifiable without trusting any single organisation or government body.",
              },
              {
                icon: "🛡️",
                title: "Tamper-Resistant by Design",
                body: "Once a vote is included in a confirmed block, changing it would require re-mining that block and every block after it — computationally infeasible on a large proof-of-stake network like Ethereum.",
              },
            ].map((item) => (
              <div key={item.title} className="info-card">
                <div className="info-icon">{item.icon}</div>
                <h3 className="info-title">{item.title}</h3>
                <p className="info-body">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            LIMITATIONS SECTION
            Academic honesty — what this demo does NOT do.
        ════════════════════════════════════════ */}
        <section className="section limitations-panel">
          <h2 className="section-title">⚠️ Limitations of This Demo</h2>
          <p className="limitations-intro">
            This is a <strong>simulated frontend</strong> built for a university coursework demonstration.
            The following limitations apply — a production voting system would need to address each of these:
          </p>
          <div className="limits-grid">
            {[
              {
                icon: "🖥️",
                title: "Frontend Simulation Only",
                body: "No real blockchain transactions occur. Votes are stored in React state (RAM) and are lost on page refresh. The wallet address is randomly generated — not read from MetaMask or any real wallet.",
              },
              {
                icon: "🪪",
                title: "No Identity Verification",
                body: "A real election requires proof that each voter is a unique eligible human. Blockchain alone cannot prevent one person from creating multiple wallets to cast multiple votes.",
              },
              {
                icon: "🔐",
                title: "Blockchain ≠ One Person, One Vote",
                body: "Ethereum wallet addresses are cheap and easy to create. Without a KYC (Know Your Customer) layer or zero-knowledge proof of personhood, the 'one wallet = one vote' rule is trivially bypassed.",
              },
              {
                icon: "🌐",
                title: "No Smart Contract Deployed",
                body: "The Voting.sol file included in this project has not been deployed to any network. Connecting this UI to a real contract would require ethers.js and a testnet or mainnet deployment via Hardhat or Foundry.",
              },
            ].map((item) => (
              <div key={item.title} className="limit-card">
                <span className="limit-icon">{item.icon}</span>
                <div>
                  <h3 className="limit-title">{item.title}</h3>
                  <p className="limit-body">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="footer">
        <p>⛓️ Blockchain Voting App — University Coursework Demo</p>
        <p className="footer-sub">Built with Next.js &amp; React · Solidity smart contract included · No real transactions</p>
      </footer>

      {/* ════════════════════════════════════════
          GLOBAL CSS
          All styles live here to keep everything in one file.
          CSS custom properties (--variables) at :root keep
          colours and sizes consistent across every component.
      ════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@400;500;600;700;800&display=swap');

        :root {
          --bg:        #07090f;
          --surface:   #0f1624;
          --surface2:  #161f33;
          --border:    #1e2d47;
          --border-hi: #2a3f60;
          --accent:    #4f8ef7;
          --accent2:   #06d6c4;
          --success:   #22c55e;
          --warning:   #f59e0b;
          --text:      #dde6f5;
          --muted:     #556680;
          --r:         18px;
          --r-sm:      10px;
          --shadow-lg: 0 8px 40px rgba(0,0,0,.55);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Outfit', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Toast ── */
        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          padding: 13px 20px; border-radius: var(--r-sm);
          font-size: 14px; font-weight: 500; max-width: 340px;
          box-shadow: var(--shadow-lg); border: 1px solid transparent;
          animation: toastIn .3s cubic-bezier(.34,1.56,.64,1) both;
        }
        .toast--success { background:#0f2a1a; border-color:var(--success); color:#86efac; }
        .toast--warning { background:#2a1a06; border-color:var(--warning); color:#fcd34d; }
        .toast--info    { background:var(--surface2); border-color:var(--border-hi); color:var(--text); }
        @keyframes toastIn {
          from { opacity:0; transform:translateY(-14px) scale(.95); }
          to   { opacity:1; transform:none; }
        }

        /* ── TX Overlay ── */
        .tx-overlay {
          position:fixed; inset:0; z-index:9998;
          background:rgba(0,0,0,.75); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          animation:fadeIn .2s ease;
        }
        .tx-modal {
          background:var(--surface2); border:1px solid var(--border-hi);
          border-radius:var(--r); padding:48px 64px;
          text-align:center; box-shadow:var(--shadow-lg); min-width:280px;
        }
        .tx-spinner {
          width:48px; height:48px;
          border:3px solid var(--border-hi); border-top-color:var(--accent);
          border-radius:50%; margin:0 auto 20px;
          animation:spin .9s linear infinite;
        }
        .tx-check   { font-size:48px; margin-bottom:16px; animation:popIn .4s cubic-bezier(.34,1.56,.64,1); }
        .tx-phase   { font-size:18px; font-weight:700; margin-bottom:8px; }
        .tx-phase--ok { color:var(--success); }
        .tx-sub     { font-size:13px; color:var(--muted); }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn  { from { transform:scale(0); } to { transform:scale(1); } }

        /* ── Header ── */
        .header {
          background:var(--surface); border-bottom:1px solid var(--border);
          position:sticky; top:0; z-index:200;
        }
        .header-inner {
          max-width:1120px; margin:0 auto; padding:14px 28px;
          display:flex; align-items:center; justify-content:space-between;
          gap:16px; flex-wrap:wrap;
        }
        .brand { display:flex; align-items:center; gap:14px; }
        .brand-icon { font-size:34px; line-height:1; }
        .brand-name {
          font-size:20px; font-weight:800;
          background:linear-gradient(100deg,#fff 20%,var(--accent2));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .brand-tagline { font-size:11px; color:var(--muted); font-family:'DM Mono',monospace; margin-top:2px; }

        /* Wallet button */
        .wallet-btn {
          display:flex; align-items:center; gap:9px;
          padding:10px 18px; border-radius:var(--r-sm); border:none;
          font-family:'DM Mono',monospace; font-size:13px; font-weight:500;
          cursor:pointer;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          color:#fff;
          transition:opacity .18s, transform .18s, box-shadow .18s;
        }
        .wallet-btn:hover {
          opacity:.88; transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(79,142,247,.35);
        }
        .wallet-btn:active { transform:translateY(0); }
        .wallet-btn--on {
          background:var(--surface2); border:1px solid var(--success);
          color:var(--success); box-shadow:0 0 12px rgba(34,197,94,.15);
        }
        .wallet-btn--on:hover { box-shadow:0 0 20px rgba(34,197,94,.25); }
        .wallet-dot {
          width:9px; height:9px; border-radius:50%;
          background:var(--success); box-shadow:0 0 6px var(--success);
          animation:pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

        .wallet-bar {
          display:flex; align-items:center; gap:12px; flex-wrap:wrap;
          padding:7px 28px;
          background:rgba(34,197,94,.06); border-top:1px solid rgba(34,197,94,.15);
          font-family:'DM Mono',monospace; font-size:11.5px;
        }
        .wallet-bar-label { color:var(--success); font-weight:500; }
        .wallet-bar-addr  { color:var(--text); letter-spacing:.04em; }
        .wallet-bar-net   { color:var(--muted); margin-left:auto; }

        /* ── Main layout ── */
        .main { max-width:1120px; margin:0 auto; padding:52px 28px 80px; }

        /* Hero */
        .hero { text-align:center; margin-bottom:72px; }
        .hero-title {
          font-size:clamp(34px,6vw,58px); font-weight:800;
          background:linear-gradient(140deg,#fff 25%,var(--accent2) 80%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          margin-bottom:18px; line-height:1.1;
        }
        .hero-desc { color:var(--muted); font-size:16px; max-width:560px; margin:0 auto 20px; line-height:1.75; }
        .hero-hint { font-size:14px; font-weight:500; }
        .hero-hint--warn { color:var(--warning); }
        .hero-hint--ok   { color:var(--success); }

        /* Section */
        .section { margin-bottom:72px; }
        .section-title {
          font-size:22px; font-weight:800; margin-bottom:28px;
          padding-left:16px; border-left:4px solid var(--accent); line-height:1.2;
        }

        /* ── Candidate cards ── */
        .cards-grid {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
          gap:24px;
        }
        .card {
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--r); padding:28px;
          display:flex; flex-direction:column; gap:18px;
          position:relative; overflow:hidden;
          transition:border-color .25s, transform .2s, box-shadow .25s;
        }
        .card:hover { transform:translateY(-5px); border-color:var(--border-hi); box-shadow:0 12px 40px rgba(0,0,0,.4); }
        .card--voted { transform:translateY(-3px) !important; }

        .card-ribbon {
          position:absolute; top:14px; right:-6px;
          font-size:11px; font-weight:700; font-family:'DM Mono',monospace;
          color:#fff; padding:4px 14px; border-radius:4px 0 0 4px;
          letter-spacing:.03em;
        }
        .card-avatar {
          width:66px; height:66px; border-radius:50%;
          border:2px solid; background:var(--surface2);
          display:flex; align-items:center; justify-content:center; font-size:30px;
        }
        .card-name  { font-size:19px; font-weight:700; }
        .card-party { font-size:12px; font-family:'DM Mono',monospace; margin-top:2px; }
        .card-desc  { font-size:14px; color:var(--muted); line-height:1.65; flex:1; }

        .vote-badge {
          display:flex; align-items:baseline; gap:6px;
          background:var(--surface2); border-radius:var(--r-sm);
          padding:8px 14px; width:fit-content;
        }
        .vote-num { font-size:30px; font-weight:800; font-family:'DM Mono',monospace; }
        .vote-lbl { font-size:12px; color:var(--muted); }

        .vote-btn {
          width:100%; padding:13px 16px; border-radius:var(--r-sm);
          border:none; cursor:pointer;
          font-family:'Outfit',sans-serif; font-size:15px; font-weight:700;
          color:#fff; letter-spacing:.01em;
          transition:opacity .18s, transform .18s, box-shadow .18s;
        }
        .vote-btn:not(:disabled):hover { opacity:.85; transform:scale(1.025); box-shadow:0 6px 20px rgba(0,0,0,.35); }
        .vote-btn:not(:disabled):active { transform:scale(.98); }
        .vote-btn:disabled { cursor:not-allowed; }
        .vote-btn--done   { background:var(--success) !important; opacity:1 !important; }
        .vote-btn--locked { background:var(--surface2) !important; color:var(--muted) !important; border:1px solid var(--border); }
        .vote-btn--ghost  { background:var(--surface2) !important; color:var(--muted) !important; opacity:.6 !important; }

        /* ── Results ── */
        .results-panel {
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--r); padding:36px;
        }
        .results-meta {
          display:flex; align-items:center; gap:10px;
          color:var(--muted); font-size:14px;
          font-family:'DM Mono',monospace; margin-bottom:28px;
        }
        .results-total-num { font-size:22px; font-weight:800; color:var(--accent); }
        .results-list { display:flex; flex-direction:column; gap:20px; }

        .result-row   { display:flex; align-items:center; gap:14px; }
        .result-rank  { font-family:'DM Mono',monospace; font-size:14px; min-width:28px; }
        .result-emoji { font-size:22px; }
        .result-info  { flex:1; }
        .result-meta-row { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
        .result-name  { font-weight:600; font-size:15px; }
        .result-pct   { font-family:'DM Mono',monospace; font-size:13px; font-weight:500; }
        .result-count { font-family:'DM Mono',monospace; font-size:12px; color:var(--muted); white-space:nowrap; }

        .bar-track { height:7px; background:var(--surface2); border-radius:99px; overflow:hidden; }
        .bar-fill  { height:100%; border-radius:99px; transition:width .7s cubic-bezier(.4,0,.2,1); }

        /* ── Info cards (How it works) ── */
        .info-grid {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
          gap:20px;
        }
        .info-card {
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--r); padding:26px;
          transition:border-color .2s, transform .2s;
        }
        .info-card:hover { border-color:var(--border-hi); transform:translateY(-3px); }
        .info-icon  { font-size:30px; margin-bottom:12px; }
        .info-title { font-size:15px; font-weight:700; margin-bottom:8px; }
        .info-body  { font-size:13px; color:var(--muted); line-height:1.65; }

        /* ── Limitations ── */
        .limitations-panel {
          background:#130a04; border:1px solid #3d2008;
          border-radius:var(--r); padding:36px;
        }
        .limitations-panel .section-title { border-color:var(--warning); }
        .limitations-intro { font-size:14px; color:#c8a97a; line-height:1.7; margin-bottom:24px; max-width:740px; }
        .limits-grid { display:flex; flex-direction:column; gap:16px; }
        .limit-card {
          background:rgba(255,255,255,.03); border:1px solid #2d1a06;
          border-radius:var(--r-sm); padding:18px 20px;
          display:flex; gap:16px; align-items:flex-start;
          transition:border-color .2s;
        }
        .limit-card:hover { border-color:#5a340d; }
        .limit-icon  { font-size:24px; flex-shrink:0; margin-top:2px; }
        .limit-title { font-size:14px; font-weight:700; color:#f3c89a; margin-bottom:4px; }
        .limit-body  { font-size:13px; color:#9a7a5a; line-height:1.6; }

        /* ── Footer ── */
        .footer {
          background:var(--surface); border-top:1px solid var(--border);
          text-align:center; padding:28px 24px;
          font-size:13px; color:var(--muted); line-height:1.9;
        }
        .footer-sub { font-family:'DM Mono',monospace; font-size:11px; }

        /* ── Responsive ── */
        @media (max-width:640px) {
          .header-inner { flex-direction:column; align-items:flex-start; }
          .wallet-bar   { flex-direction:column; align-items:flex-start; gap:4px; }
          .wallet-bar-net { margin-left:0; }
          .result-row   { flex-wrap:wrap; }
          .tx-modal     { padding:36px 28px; }
          .results-panel, .limitations-panel { padding:24px 18px; }
        }
      `}</style>
    </div>
  );
}