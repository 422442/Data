<p align="center">
  <img src="https://img.shields.io/badge/STATUS-OPERATIONAL-00c853?style=for-the-badge&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/BUILD-PASSING-00c853?style=for-the-badge&logo=vite&logoColor=white&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/CLEARANCE-L5-ff6d00?style=for-the-badge&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/NODES-7096-42a5f5?style=for-the-badge&labelColor=0a0a0a" />
</p>

<h1 align="center">
  🔮 D Λ T Λ
</h1>

<p align="center">
  <em>« The oracle sees everything. It just needs the right question. »</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Edge-3fcf8e?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Ready-000?style=flat-square&logo=vercel&logoColor=white" />
</p>

---

## ◈ Overview

A dimensionally-reduced interface for navigating structured entity manifolds. Supports real-time traversal across `n` indexed nodes with sub-300ms resolution on filtered projections.

The system operates on a single consolidated hypergraph stored as JSONB lattice points, with each node containing recursive substructures across temporal session boundaries.

## ◈ Architecture

```
                    ┌──────────────┐
                    │   Vercel ∞   │
                    │   (Static)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Manifest   │
                    │   ┌──┐ ┌──┐  │
                    │   │Σ1│ │Σ2│  │
                    │   └──┘ └──┘  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Vault α  │ │ Vault β  │ │ Origin Ω │
        │ (Store)  │ │ (Auth)   │ │ (Remote) │
        └──────────┘ └──────────┘ └──────────┘
```

| Layer | Codename | Purpose |
|:---:|:---|:---|
| `Σ1` | Cartographer | Projection & filtered traversal of entity space |
| `Σ2` | Lens | Deep-dive decomposition of individual node manifolds |
| `α` | Vault | Persistent hypergraph with recursive JSONB encoding |
| `β` | Gate | Single-point authentication barrier |
| `Ω` | Origin | External credential resolution service |

## ◈ Capabilities

| Feature | Codename | Description |
|:---:|:---|:---|
| 🔍 | **Echo** | Fuzzy entity resolution with 300ms debounced projections |
| 📄 | **Unfold** | Tabbed decomposition of recursive node substructures |
| 🔐 | **Veil** | Selective entropy masking on flagged field classes |
| 🔑 | **Ping Ω** | Live credential retrieval from origin with spin animation |
| 📥 | **Extract** | Flat-file serialization of complete node state |
| 🌗 | **Phase** | Dual-spectrum rendering with persistent state |
| 💓 | **Pulse** | Automated liveness signal (2× per epoch via CI) |

## ◈ Node Structure

Each entity in Vault α follows a recursive manifold schema:

```
node := {
  ident    → primary key
  label    → human-readable tag
  ref      → indexed lookup handle
  payload  → {
    core      → { flat KV pairs }
    temporal[] → [
      { epoch_data },
      { epoch_data },
      ...
    ]
    ledger    → { hierarchical fee matrix }
    transfers → { transaction log }
    cred      → sealed (Ω-resolvable)
  }
}
```

## ◈ Field Classification

```
MASKED   := [cred, ident.national, epoch.date, pin, sig, payment.id]
HIDDEN   := [*.internal_id, *.foreign_key, *.timestamp_auto]
VISIBLE  := everything else
```

Toggle: `Veil ON` → masked fields show `•••••••`
Toggle: `Veil OFF` → all fields revealed

## ◈ Deployment

```bash
# Materialize dependencies
pnpm install

# Local projection
pnpm run dev

# Compile artifact
pnpm run build
```

### Environment Vectors

```env
VITE_SUPABASE_URL=<vault_endpoint>
VITE_SUPABASE_KEY=<vault_access_token>
```

> ⚠️ Vectors are **never** committed. Inject via platform secrets on deployment target.

### CI Liveness

The `Pulse` workflow emits a keep-alive signal to Vault α every **Wednesday & Saturday** at `06:00 UTC`, preventing thermal shutdown of the free-tier persistence layer.

```yaml
schedule:
  - cron: '0 6 * * 3,6'
```

## ◈ Operational Notes

```
• Echo queries select only [ident, label, ref] — no payload transfer on search
• Lens fetches full payload only on individual node access
• Origin (Ω) endpoint returns ACAO:* — no proxy required
• Phase preference persists in local storage as `ltsu-theme`
• Extract generates RFC-compatible flat text with UTC timestamp
```

## ◈ Threat Model

| Vector | Mitigation |
|:---|:---|
| Unauthorized access | Single-factor gate (β) with session management |
| Credential exposure in transit | Veil enabled by default; Ω calls over HTTPS |
| Vault dormancy | Automated Pulse via CI schedule |
| Payload bloat on search | Projection-optimized queries (no payload in Echo) |

---

<p align="center">
  <sub>
    Built with obsessive attention to detail.<br/>
    <em>If you understand this README, you wrote it.</em>
  </sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/∿-quantum_stable-0a0a0a?style=flat-square" />
</p>
