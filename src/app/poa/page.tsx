import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PoaDashboardMain } from '@/components/poa/poa-dashboard-main'

export default async function PEIPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/iniciar-sesion')
  }

  if (!hasPermission(session, 'PEI', 'Edit')) {
    redirect('/no-authorizado')
  }

  return <PoaDashboardMain/>
}