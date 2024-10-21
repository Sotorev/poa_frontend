"use client";
import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PoaFinancialApproval } from '@/components/poa/poa-financial-approval'
import { withAuth } from '@/components/auth/with-auth'

function POAPage() {
  // const session = await getServerSession()

  // if (!session) {
  //   redirect('/iniciar-sesion')
  // }

  // if (!hasPermission(session, 'POA', 'Edit')) {
  //   redirect('/no-authorizado')
  // }

  return <PoaFinancialApproval/>
}

export default withAuth(POAPage, {
  requiredPermissions: [{ module: 'POA', action: 'View' }],
  requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})