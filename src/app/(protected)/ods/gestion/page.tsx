import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OdsComponent from '@/components/ods/ods-component'

export default async function UsersPage() {
  // const session = await getServerSession()

  // if (!session) {
  //   redirect('/iniciar-sesion')
  // }

  // if (!hasPermission(session, 'ODS', 'Edit')) {
  //   redirect('/no-authorizado')
  // }

  return <OdsComponent />
}