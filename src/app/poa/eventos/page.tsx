import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CrearIntervencionTablaComponent } from '@/components/crear-intervencion-tabla'

export default async function PEIPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/iniciar-sesion')
  }

  if (!hasPermission(session, 'PEI', 'Edit')) {
    redirect('/no-authorizado')
  }

  return <CrearIntervencionTablaComponent/>
}