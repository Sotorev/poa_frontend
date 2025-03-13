"use client"

import { EventFinishedView } from "@/components/poa/finalizacion/UI.eventFinishedView"

export default function FinalizarPage() {

    const eventsFinished = [
        {
            eventId: 1,
            name: "Conferencia de Tecnología 2024",
            completionDate: "2024-05-15",
            testDocuments: [
                {
                    documentId: 101,
                    fileName: "informeFinal.pdf",
                    fileId: "1", // debe ser string
                    fileUrl: "https://example.com/informe1.pdf",
                    uploadDate: "2024-05-14"
                },
                {
                    documentId: 102,
                    fileName: "evaluacionImpacto.pdf",
                    fileId: "2", // debe ser string
                    fileUrl: "https://example.com/evaluacion1.pdf",
                    uploadDate: "2024-05-14"
                }
            ],
            campus: "Campus Central",
            objective: "Fomentar la innovación tecnológica en el ámbito académico.",
            responsibles: [
                {
                    responsibleId: 1,
                    name: "Dr. Juan Pérez",
                    responsibleRole: "Coordinador"
                },
                {
                    responsibleId: 2,
                    name: "Ing. María López",
                    responsibleRole: "Asesora"
                }
            ],
            totalCost: 5000
        },
        {
            eventId: 2,
            name: "Feria de Ciencias 2024",
            completionDate: "2024-06-10",
            testDocuments: [
                {
                    documentId: 201,
                    fileName: "resumenProyectos.pdf",
                    fileId: "3", // debe ser string
                    fileUrl: "https://example.com/resumen.pdf",
                    uploadDate: "2024-06-09"
                }
            ],
            campus: "Campus Norte",
            objective: "Promover la ciencia y la investigación entre los estudiantes.",
            responsibles: [
                {
                    responsibleId: 3,
                    name: "Prof. Luis Ramírez",
                    responsibleRole: "Organizador"
                }
            ],
            totalCost: 3000
        }
    ];

    const availableEvents = [
        {
            eventId: 1,
            name: "Conferencia de Innovación 2024",
            objective: "Impulsar la transformación digital en empresas.",
            campus: {
                campusId: 1,
                name: "Campus Principal"
            },
            responsibles: [
                {
                    responsibleId: 1,
                    name: "Lic. Carlos Ramírez",
                    responsibleRole: "Coordinador"
                },
                {
                    responsibleId: 2,
                    name: "Ing. Ana Gómez",
                    responsibleRole: "Asistente"
                }
            ],
            totalCost: 7500,
            dates: [
                {
                    startDate: "2024-05-10",
                    endDate: "2024-05-12"
                }
            ]
        }
    ];



    return <EventFinishedView events={eventsFinished} availableEvents={availableEvents} />
}
