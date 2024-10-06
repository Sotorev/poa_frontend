import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsersComponent from '@/components/users/users-component'

export default async function UsersPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  if (!hasPermission(session, 'Users', 'Edit')) {
    redirect('/no-authorizado')
  }

  return <UsersComponent />
}