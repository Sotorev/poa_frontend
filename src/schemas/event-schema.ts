import { z } from "zod";

// Enum definitions
const EventTypeEnum = z.enum(['Actividad', 'Proyecto']);
const EventNatureEnum = z.enum(['Planificado', 'Extraordinario']);
const ResponsibleRoleEnum = z.enum(['Principal', 'Ejecución', 'Seguimiento']);

// Nested schemas
const eventDateSchema = z.object({
	eventDateId: z.number().int().min(1, 'El ID de la fecha del evento es requerido').optional(),
	startDate: z.preprocess((arg) => {
		if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
	}, z.date({ required_error: 'La fecha de inicio es requerida' })),
	endDate: z.preprocess((arg) => {
		if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
	}, z.date({ required_error: 'La fecha de fin es requerida' })),
	statusId: z.number().int().min(1, 'El ID del estado es requerido').optional(),
	reasonForChange: z.string().optional(),
	isDeleted: z.boolean().optional(),
	executionEndDate: z.preprocess((arg) => {
		if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
		return null;
	}, z.date().nullable()),
	executionStartDate: z.preprocess((arg) => {
		if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
		return null;
	}, z.date().nullable()),

});


const PurchaseTypeId = z.number().int().min(1, 'El tipo de compra es requerido');
const odsSchema = z.array(z.number().int().min(1, 'El ID del ODS es requerido'))

const eventFinancingSchema = z.object({
	eventFinancingId: z.number().int().min(1, 'El ID del financiamiento del evento es requerido').optional(),
	financingSourceId: z.number().int().min(1, 'El ID de la fuente de financiamiento es requerido').optional(),
	amount: z.number().min(0, 'El monto debe ser no negativo').optional(),
	percentage: z.number().min(0).max(100, 'El porcentaje debe estar entre 0 y 100').optional(),
	isDeleted: z.boolean().optional(),
});

const eventResourceSchema = z.object({
	resourceId: z.number().int().min(1, 'El ID del recurso es requerido'),
	isDeleted: z.boolean().optional(),
});

const eventResponsibleSchema = z.object({
	isDeleted: z.boolean().optional(),
	eventResponsibleId: z.number().int().min(1, 'El ID del responsable del evento es requerido').optional(),
	responsibleRole: ResponsibleRoleEnum.optional().refine(val => val !== undefined, { message: "El rol del responsable es requerido" }),
	name: z.string().min(1, { message: 'El nombre es requerido' }).optional(),
});

export const createFullEventSchema = z.object({
	name: z.string().min(1, 'El nombre del evento es requerido'),
	type: EventTypeEnum,
	poaId: z.number().int().min(1, 'El ID del POA es requerido'),
	completionPercentage: z.number().min(0).max(100).optional(),
	campusId: z.number().int().min(1, 'El Campus es requerido'),
	isDeleted: z.boolean().optional(),
	objective: z.string().min(1, 'El objetivo es requerido').max(755, 'El objetivo no puede tener más de 755 caracteres'),
	eventNature: EventNatureEnum,
	isDelayed: z.boolean(),
	achievementIndicator: z.string().min(1, 'El indicador de logro es requerido').max(755, 'El indicador de logro no puede tener más de 755 caracteres'),
	strategicObjectiveId: z.number({ required_error: "Por favor, seleccione un objetivo estratégico." }).int().min(1, 'El ID del objetivo estratégico debe ser válido.'),
	strategies: z.array(z.object({ strategyId: z.number() })).min(1, 'Se requiere al menos una estrategia'),
	purchaseTypeId: PurchaseTypeId,
	totalCost: z.number().min(0, 'El costo total debe ser no negativo'),
	dates: z.array(eventDateSchema).min(1, 'Se requiere al menos una fecha de evento'),
	financings: z.array(eventFinancingSchema)
		.min(1, 'Se requiere al menos un financiamiento.')
		.refine(
			(financings) => financings.some(fin => !fin.isDeleted), 
			{ message: 'Se requiere al menos un financiamiento activo.' }
		),
	resources: z.array(eventResourceSchema).min(1, 'Se requiere al menos un recurso'),
	responsibles: z.array(eventResponsibleSchema).min(1, 'Se requiere al menos un responsable')
		.refine(
			(responsibles) => responsibles.some(resp => !resp.isDeleted),
			{ message: 'Se requiere al menos un responsable activo.' }
		),
	interventions: z.number().array().min(1, 'Se requiere al menos una intervención'),
	ods: odsSchema.min(1, 'Se requiere al menos un ODS'),
	userId: z.number().int().min(1, 'El ID del usuario es requerido'),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});