"use client";
import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PoaDashboardMain } from '@/components/poa/poa-dashboard-main'
import { withAuth } from '@/components/auth/with-auth'

function POAPage() {
  // const session = await getServerSession()

  // if (!session) {
  //   redirect('/iniciar-sesion')
  // }

  // if (!hasPermission(session, 'POA', 'Edit')) {
  //   redirect('/no-authorizado')
  // }

  return <PoaDashboardMain/>
}

export default withAuth(POAPage, {
  requiredPermissions: [{ module: 'POA', action: 'View' }],
  requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})