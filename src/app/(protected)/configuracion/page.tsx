import { auth } from '@/auth'
import React from 'react'

const Configuracion = async () => {
	const session = await auth();
	return (
		JSON.stringify(session)
	)
}

export default Configuracion