import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PEIComponent from '@/components/pei/pei'

export default async function PEIPage() {
	const session = await getServerSession()

	if (!session) {
		redirect('/iniciar-sesion')
	}

	if (!hasPermission(session, 'PEI', 'Edit')) {
		redirect('/no-autorizado')
	}

	return <PEIComponent />
}