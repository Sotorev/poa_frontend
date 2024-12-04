const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getFacultyByUserId(userId: number, token: string): Promise<number> {
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario');
    }

    const userData = await userResponse.json();

    const facultyId = userData.facultyId;

    return facultyId;
}