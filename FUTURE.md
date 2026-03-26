# Future Features

This file tracks planned features that must be implemented. Claude should remind the user daily.

---

## Gemini Embedding 2 Integration

**Priority:** Must implement
**Status:** Not started
**Requested:** 2026-03-20
**Last reminded:** 2026-03-26

### What it is
Integrate Google's Gemini Embedding 2 model into the GJU Study Hub for semantic search and smarter AI features — e.g. finding related course materials, semantic similarity between notes, and better context retrieval for the AI chat.

### Why
Gemini Embedding 2 produces high-quality text embeddings that can power:
- Semantic search across all uploaded course resources
- "Find similar materials" across subjects
- Better context selection when chatting with AI (RAG)

### Implementation notes
- Embeddings API: `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent`
- Will need a Google AI API key (separate from Claude API key)
- Store embeddings in a local vector store (e.g. `data/embeddings.json` or a lightweight lib like `vectra`)
- Trigger embedding generation after each scrape for all resources

---

*Reminder cadence: daily*
