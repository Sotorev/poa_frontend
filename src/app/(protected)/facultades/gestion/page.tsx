import { redirect } from 'next/navigation'
import FacultyComponent from '@/components/faculty/faculties-component'

export default async function UsersPage() {
  // const session = await getServerSession()

  // if (!session) {
  //   redirect('/iniciar-sesion')
  // }

  // if (!hasPermission(session, 'Faculty', 'Edit')) {

  //   redirect('/no-authorizado')
  // }

  return <FacultyComponent />
}