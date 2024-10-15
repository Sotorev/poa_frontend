import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
	// const session = await getServerSession();

	// if (session) {
	// 	return NextResponse.json(session);
	// } else {
	// 	return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
	// }
}