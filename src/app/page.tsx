import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/dashboard/dashboard'

export default async function DashBoardPage() {

  const session = await getServerSession()

  if (!session) {
    redirect('/iniciar-sesion')
  }

  if (!hasPermission(session, 'PEI', 'Edit')) {
    redirect('/no-autorizado')
  }

  return (
    <Dashboard />
  )
}

