import UsersComponent from '@/components/users/app-users-page'
import { ProtectedRoute } from '../../_components/protected-route'

export default async function UsersPage() {

  return(
    <ProtectedRoute action="View" moduleName="Auth">
      <UsersComponent />
    </ProtectedRoute>
  )

}