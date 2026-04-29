import { McServerStatus } from "$lib/types"

export const serverStatusVariant = (status: McServerStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case McServerStatus.Running:
      return "default"
    case McServerStatus.Starting:
    case McServerStatus.Stopping:
      return "secondary"
    case McServerStatus.Stopped:
    default:
      return "destructive"
  }
}
