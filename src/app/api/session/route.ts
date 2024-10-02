import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from '@/lib/server-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).end()
	}

	const session = await getServerSession()

	if (session) {
		res.status(200).json(session)
	} else {
		res.status(401).json({ error: 'Not authenticated' })
	}
}