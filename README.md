# Norn

Norn is a lightweight Minecraft server management panel built with SvelteKit, pnpm, and Node.Js.

## Installation

### Docker

Build the image:

```bash
docker build -t norn .
```

Run the container:

```bash
docker run \
  -p 3000:3000 \
  -p 25565-25600:25565-25600 \
  norn
```

Windows PowerShell:

```powershell
docker run `
  -p 3000:3000 `
  -p 25565-25600:25565-25600 `
  norn
```

---

### Manual Installation

#### Requirements

- Node.Js 24 or newer
- pnpm
- git

---

Clone the repository:

```bash
git clone https://github.com/shellawa/norn
cd norn
```

---

## Running Norn

### Unix / Linux / macOS

Run:

```bash
chmod +x start.sh
./start.sh
```

### Windows

Run:

```bat
start.bat
```

---

### Ports

- `3000`: Web panel
- `25565-25600` (docker): Minecraft server port

Adjust mappings as needed for your deployment.
