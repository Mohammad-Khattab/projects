import asyncio
import json
import os
import shutil
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

CLAUDE_BIN = shutil.which("claude") or str(Path.home() / ".local/bin/claude.exe")
DATA_DIR = Path(__file__).parent / "data"
VALID_MODELS = {"opus", "sonnet", "haiku"}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _read(name: str) -> list:
    path = DATA_DIR / f"{name}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _write(name: str, data: list):
    path = DATA_DIR / f"{name}.json"
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# ── Pydantic models ───────────────────────────────────────────────────────────

class GameItem(BaseModel):
    name: str
    url: str
    desc: str = ""
    thumb: str = ""

class SiteItem(BaseModel):
    name: str
    url: str
    desc: str = ""
    thumb: str = ""

class ProjectItem(BaseModel):
    title: str
    notes: str = ""

class ProjectUpdate(BaseModel):
    title: str = ""
    notes: str = ""

class ChatRequest(BaseModel):
    message: str
    model: str = "sonnet"


# ── Serve frontend ────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    html_path = Path(__file__).parent / "index.html"
    return HTMLResponse(content=html_path.read_text(encoding="utf-8"))


# ── Games ─────────────────────────────────────────────────────────────────────

@app.get("/api/games")
async def list_games():
    return _read("games")


@app.post("/api/games")
async def add_game(item: GameItem):
    games = _read("games")
    entry = {"id": str(uuid.uuid4()), **item.model_dump(), "created": time.time()}
    games.append(entry)
    _write("games", games)
    return entry


@app.delete("/api/games/{item_id}")
async def delete_game(item_id: str):
    games = _read("games")
    games = [g for g in games if g["id"] != item_id]
    _write("games", games)
    return {"ok": True}


# ── Sites ─────────────────────────────────────────────────────────────────────

@app.get("/api/sites")
async def list_sites():
    return _read("sites")


@app.post("/api/sites")
async def add_site(item: SiteItem):
    sites = _read("sites")
    entry = {"id": str(uuid.uuid4()), **item.model_dump(), "created": time.time()}
    sites.append(entry)
    _write("sites", sites)
    return entry


@app.delete("/api/sites/{item_id}")
async def delete_site(item_id: str):
    sites = _read("sites")
    sites = [s for s in sites if s["id"] != item_id]
    _write("sites", sites)
    return {"ok": True}


# ── Projects ──────────────────────────────────────────────────────────────────

@app.get("/api/projects")
async def list_projects():
    return _read("projects")


@app.post("/api/projects")
async def create_project(item: ProjectItem):
    projects = _read("projects")
    entry = {
        "id": str(uuid.uuid4()),
        "title": item.title,
        "notes": item.notes,
        "created": time.time(),
    }
    projects.append(entry)
    _write("projects", projects)
    return entry


@app.patch("/api/projects/{project_id}")
async def update_project(project_id: str, body: ProjectUpdate):
    projects = _read("projects")
    for p in projects:
        if p["id"] == project_id:
            if body.title:
                p["title"] = body.title
            if body.notes is not None:
                p["notes"] = body.notes
            _write("projects", projects)
            return p
    raise HTTPException(404, "Project not found")


@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    projects = _read("projects")
    projects = [p for p in projects if p["id"] != project_id]
    _write("projects", projects)
    return {"ok": True}


# ── Project AI chat ───────────────────────────────────────────────────────────

@app.post("/api/projects/{project_id}/chat")
async def project_chat(project_id: str, req: ChatRequest):
    projects = _read("projects")
    project = next((p for p in projects if p["id"] == project_id), None)
    if not project:
        raise HTTPException(404, "Project not found")

    model = req.model.lower()
    if model not in VALID_MODELS:
        raise HTTPException(400, f"Invalid model: {req.model}")

    # Build system prompt from project context
    system_prompt = (
        f"You are helping Mohammad brainstorm and develop the following project idea.\n\n"
        f"Project: {project['title']}\n"
        f"Notes: {project['notes'] or '(no notes yet)'}\n\n"
        f"Be concise, practical, and creative. Focus on actionable ideas."
    )

    message = req.message.strip()
    if not message:
        raise HTTPException(400, "Message cannot be empty")

    # Use a unique session ID per project so conversations stay anchored
    session_id = f"mhub-proj-{project_id[:8]}"

    cmd = [
        CLAUDE_BIN,
        "--print",
        "--model", model,
        "--output-format", "stream-json",
        "--include-partial-messages",
        "--verbose",
        "--system-prompt", system_prompt,
        message,
    ]

    def run_claude_sync():
        """Run claude subprocess synchronously and return all stdout lines."""
        import subprocess as _sp
        proc = _sp.Popen(
            cmd,
            stdin=_sp.DEVNULL,
            stdout=_sp.PIPE,
            stderr=_sp.PIPE,
        )
        stdout, stderr = proc.communicate()
        return stdout.decode("utf-8", errors="replace"), stderr.decode("utf-8", errors="replace"), proc.returncode

    async def stream_response():
        try:
            stdout_text, stderr_text, returncode = await asyncio.to_thread(run_claude_sync)
        except Exception as e:
            yield f"data: [ERROR] subprocess failed: {str(e).replace(chr(10), ' ')}\n\n"
            yield "data: [DONE]\n\n"
            return

        got_text = False
        for raw_line in stdout_text.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            obj_type = obj.get("type", "")

            if obj_type == "stream_event":
                event = obj.get("event", {})
                if (
                    event.get("type") == "content_block_delta"
                    and event.get("delta", {}).get("type") == "text_delta"
                ):
                    got_text = True
                    chunk = event["delta"]["text"]
                    safe = chunk.replace("\n", "\\n")
                    yield f"data: {safe}\n\n"

            elif obj_type == "result":
                if obj.get("is_error"):
                    err = (obj.get("result", "").strip() or stderr_text.strip() or "Claude returned an error")
                    yield f"data: [ERROR] {err.replace(chr(10), ' ')}\n\n"
                elif not got_text:
                    result_text = obj.get("result", "")
                    if result_text:
                        safe = result_text.replace("\n", "\\n")
                        yield f"data: {safe}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
