# VectorForge — Build a Vector Database from Scratch in C++

A fully working **Vector Database** built from scratch in C++ with a modern React web UI.  
Implements **HNSW**, **KD-Tree**, and **Brute Force** search algorithms side-by-side, plus a **RAG pipeline** powered by a local LLM via Ollama.

> Built as an educational project to show how production vector databases like Pinecone, Weaviate, and Chroma actually work under the hood.

---

## What This Project Does

| Feature | Description |
|---|---|
| **3 Search Algorithms** | HNSW (production-grade), KD-Tree, Brute Force — run all three and compare speed |
| **3 Distance Metrics** | Cosine similarity, Euclidean distance, Manhattan distance |
| **16D Demo Vectors** | 20 pre-loaded semantic vectors across 4 categories (CS, Math, Food, Sports) |
| **2D PCA Scatter Plot** | Live visualization of semantic space — watch clusters form |
| **Real Document Embedding** | Paste any text → Ollama embeds it with `nomic-embed-text` (768D) |
| **RAG Pipeline** | Ask questions about your documents → HNSW retrieves context → local LLM answers |
| **Full REST API** | CRUD endpoints: insert, delete, search, benchmark, hnsw-info |

---

## How It Works

```
Your Text
    │
    ▼
Ollama (nomic-embed-text)          ← converts text to a 768-dimensional vector
    │
    ▼
HNSW Index (C++)                   ← indexes the vector in a multilayer graph
    │
    ▼
Semantic Search                    ← finds nearest neighbors in vector space
    │
    ▼
Ollama (llama3.2)                  ← reads retrieved chunks, generates an answer
    │
    ▼
Answer
```

**HNSW (Hierarchical Navigable Small World)** is the same algorithm used by Pinecone, Weaviate, Chroma, and Milvus. It builds a multilayer graph where each layer is progressively sparser — searches start at the top layer and zoom in, achieving O(log N) complexity instead of O(N) for brute force.

---

## Prerequisites

You need **4 things** installed on your Windows laptop:

1. **MSYS2** (gives you g++ compiler)
2. **Git**
3. **Ollama** (runs the local AI models)
4. **Node.js** (for the React frontend)

---

## Step-by-Step Setup (Windows)

### Step 1 — Install MSYS2 (C++ Compiler)

1. Go to **https://www.msys2.org** and download the installer
2. Run the installer, keep default path (`C:\msys64`)
3. After install, open **MSYS2 UCRT64** from Start Menu (the orange icon)
4. Run these commands inside the MSYS2 terminal:

```bash
pacman -Syu
```
*(Close and reopen the terminal if it asks you to)*

```bash
pacman -S mingw-w64-ucrt-x86_64-gcc
```

5. Add g++ to your Windows PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click **Advanced** → **Environment Variables**
   - Under **System variables**, find **Path**, click **Edit**
   - Click **New** and add: `C:\msys64\ucrt64\bin`
   - Click OK on all windows
   - **Open a new PowerShell** and verify:
   ```
   g++ --version
   ```
   You should see something like `g++ (GCC) 15.x.x`

---

### Step 2 — Install Git & Node.js

1. Download and install Git: **https://git-scm.com/download/win**
2. Download and install Node.js (LTS): **https://nodejs.org/**
3. Verify in PowerShell:
```powershell
git --version
node -v
npm -v
```

---

### Step 3 — Install Ollama (Local AI Models)

1. Go to **https://ollama.com** and click **Download for Windows**
2. Run the installer
3. Ollama starts automatically in the system tray
4. Open **PowerShell** and pull the two required models:

```powershell
ollama pull nomic-embed-text
ollama pull llama3.2
```

5. Verify Ollama is running:
```powershell
ollama list
```

---

### Step 4 — Clone the Repository

Open **PowerShell** and run:

```powershell
git clone https://github.com/YOUR_USERNAME/VectorForge.git
cd VectorForge
```

---

### Step 5 — Compile the C++ Server

Inside the `VectorForge/backend` folder, compile the project using CMake:

```powershell
cd backend
mkdir build
cd build
cmake ..
cmake --build . --config Release
```

> **Troubleshooting:**
> - `cmake: command not found` → Make sure CMake is installed (MSYS2 `pacman -S mingw-w64-ucrt-x86_64-cmake`)
> - `g++: command not found` → MSYS2 not in PATH, redo Step 1 point 5

---

### Step 6 — Run Everything

You will need three terminals.

**Terminal 1** — Start Ollama:
```powershell
ollama serve
```

**Terminal 2** — Start the C++ Backend:
```powershell
cd backend/build
./db.exe
```
*(Server runs on port 8080)*

**Terminal 3** — Start the React Frontend:
```powershell
cd frontend
npm install
npm run dev
```

**Open your browser** and go to the local URL provided by Vite (usually `http://localhost:5173`).

---

## Project Structure

```
VectorForge/
├── backend/
│   ├── CMakeLists.txt  ← Build system configuration
│   ├── build/          ← Compiled executable (db.exe)
│   ├── vendor/         
│   │   └── httplib.h   ← Single-header HTTP server library
│   └── src/
│       └── main.cpp    ← C++ backend (HNSW, KD-Tree, BruteForce, RAG)
├── frontend/
│   ├── src/            ← React & Vite application source
│   ├── index.html      ← Frontend entrypoint
│   └── package.json
└── README.md           ← This file
```

---

## Using the Application

### Tab 1: Search (Demo Vectors)
- Type any concept in the search box: `binary tree`, `sushi`, `basketball`
- Choose your algorithm and metric, then click **SEARCH**.
- The matching points will glow on the interactive 2D PCA scatter plot.
- Click **COMPARE ALL ALGOS** to benchmark HNSW vs KD-Tree vs Brute Force.

### Tab 2: Documents (Real Embeddings)
- Type a title and paste any text (lecture notes, Wikipedia articles).
- Click **EMBED & INSERT**. The backend automatically chunks it, queries Ollama for 768D embeddings, and stores them in HNSW.

### Tab 3: Ask AI (RAG Pipeline)
- Type a question about your documents and click **ASK AI**.
- The system embeds your query, runs an HNSW nearest-neighbor search to retrieve relevant chunks, and sends them to Llama 3.2 for a fully synthesized response!

---

## License

MIT — use this however you want.
