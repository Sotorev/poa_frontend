import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PEIComponent from '@/components/PEI'

export default async function PEIPage() {
	const session = await getServerSession()

	if (!session) {
		redirect('/login')
	}

	if (!hasPermission(session, 'PEI', 'Edit')) {
		redirect('/unauthorized')
	}

	return <PEIComponent />
}