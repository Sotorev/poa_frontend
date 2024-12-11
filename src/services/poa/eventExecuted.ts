import { ApprovalStatus } from '../../types/approvalStatus'
const API_URL = process.env.NEXT_PUBLIC_API_URL;

POST
{{base_url}}/api/eventExecutionDate
{
  "eventId": 315,
  "startDate": "2024-01-01",
  "endDate": "2024-01-10",
  "reasonForChange": "New government restriction"
}