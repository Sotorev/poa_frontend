import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CampusComponent from '@/components/campus/campus-component'

export default async function UsersPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/iniciar-sesion')
  }

  if (!hasPermission(session, 'Auth', 'Edit')) {
    redirect('/no-authorizado')
  }

  return <CampusComponent />
}