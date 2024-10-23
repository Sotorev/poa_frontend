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