export const TOTAL_STEPS = 4

export const DIFFICULTIES = ["peaceful", "easy", "normal", "hard"] as const
export const GAMEMODES = ["survival", "creative", "adventure", "spectator"] as const

export type JvmTemplate = {
  id: string
  label: string
  args: string
}

export const JVM_TEMPLATES: JvmTemplate[] = [
  { id: "g1gc", label: "G1GC Generic", args: "-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC" },
  {
    id: "aikar",
    label: "Aikar Flags",
    args: "-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch"
  },
  { id: "zgc", label: "ZGC", args: "-XX:+UseZGC -XX:+ZGenerational" }
]

export const createDefaultServerForm = () => ({
  name: "My Minecraft Server",
  providerId: "",
  version: "",
  build: "",
  javaVersion: "21",
  minMem: "1024M",
  maxMem: "4096M",
  jvmTemplate: "g1gc",
  jvmArgs: JVM_TEMPLATES[0].args,
  port: 25565,
  offlineMode: false,
  eulaAccepted: false,
  maxPlayers: 20,
  motd: "A Minecraft Server",
  pvp: true,
  seed: "",
  difficulty: "normal",
  gamemode: "survival",
  allowFlight: false,
  spawnProtection: 16
})

export type ServerCreationForm = ReturnType<typeof createDefaultServerForm>
