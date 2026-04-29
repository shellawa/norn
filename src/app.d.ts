declare global {
  namespace App {
    interface AuthUser {
      id: string
      username: string
    }

    interface Locals {
      user: AuthUser | null
      setupComplete: boolean
    }
  }
}

export {}
