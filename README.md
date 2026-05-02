# Norn

Norn is a lightweight Minecraft server management panel.

## Feature

- Manage multiple servers on the same machine.
- Automatic installation of popular server providers, including Vanilla, Paper, Purpur, Fabric, NeoForge, ~~Forge~~ (disabled due to inconsistent naming).
- Monitor players and resource stats from the panel.
- View logs and running console commands.
- File manager with text editor.
- Configuration page for things that I think are important.

## Installation

### Requirements

- git
- Node.js 24 or newer
- pnpm

---

### Clone the Repository

```bash
git clone https://github.com/shellawa/norn
cd norn
```

---

## Running with Docker

### Build the Image

```bash
docker build -t norn .
```

### Run the Container

```bash
docker run -p 3000:3000 -p 25565-25600:25565-25600 norn
```

---

## Running Manually

### Unix / Linux / macOS

```bash
chmod +x start.sh
./start.sh
```

### Windows

```bat
start.bat
```

---

## Ports

- `3000`: Web panel
- `25565-25600` (Docker): Minecraft server ports

Adjust mappings as needed for your deployment.
