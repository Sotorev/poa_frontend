import { getSession } from "@/lib/actions"
import { LoginForm } from "@/components/LoginForm"
import { LogoutButton } from "@/components/LogoutButton"

export default async function Home() {
  const session = await getSession()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-[400px] space-y-8 p-8">
        {session.isLoggedIn ? (
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter">Welcome, {session.username}!</h1>
            <p className="text-muted-foreground">You are currently logged in to the POA system.</p>
            <LogoutButton />
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  )
}