import type { ApprovalStatus } from "@/types/ApprovalStatus";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPoaApprovals(token: string, poaId: number): Promise<ApprovalStatus[]> {
  const response = await fetch(`${API_URL}/api/poaapprovals/poa/${poaId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener aprobaciones de POA: ${response.statusText}`);
  }

  const data = await response.json();

  const approvals: ApprovalStatus[] = data.map((item: any) => ({
    approvalId: item.approvalId,
    role: item.approvalStage.name,
    status: item.approvalStatus.name,
    date: item.approvalDate ? new Date(item.approvalDate).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : null,
  }));

  return approvals;
}