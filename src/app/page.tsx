import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/dashboard'

export default async function DashBoardPage() {

  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  if (!hasPermission(session, 'PEI', 'Edit')) {
    redirect('/unauthorized')
  }

  return (
    <Dashboard />
  )
}

