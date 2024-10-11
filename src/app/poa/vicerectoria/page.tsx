import { getServerSession } from '@/lib/server-auth'
import { hasPermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PoaViceChancellor} from '@/components/poa/poa-vice-chancellor'

export default async function PEIPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/iniciar-sesion')
  }

  if (!hasPermission(session, 'POA', 'View')) {
    redirect('/no-authorizado')
  }

  return <PoaViceChancellor/>
}