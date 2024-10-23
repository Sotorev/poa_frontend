import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface FormErrorProps {
	message: string | null;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
	if (!message) return null;

	return (
		<div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
			<ExclamationTriangleIcon />
			<span>{message}</span>
		</div>
	);
}