import { type ServerProvider } from "./types"
import { VanillaProvider } from "./vanilla"
import { PaperProvider } from "./paper"
import { FoliaProvider } from "./folia"
import { PurpurProvider } from "./purpur"
import { FabricProvider } from "./fabric"
import { ForgeProvider } from "./forge"
import { NeoForgeProvider } from "./neoforge"

export const providers: ServerProvider[] = [
  new VanillaProvider(),
  new PaperProvider(),
  new FoliaProvider(),
  new PurpurProvider(),
  new FabricProvider(),
  new ForgeProvider(),
  new NeoForgeProvider()
]

export const getProvider = (id: string) => providers.find((p) => p.id === id)
