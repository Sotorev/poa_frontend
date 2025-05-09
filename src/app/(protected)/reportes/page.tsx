import CostByFaculty from "@/components/reports/costByFaculty";
import GraficoODS from "@/components/reports/GraficoODS";
import GraficoPOA from "@/components/reports/GraficoPOA";
import PoaCostChart from "@/components/reports/costByObjective";
import ComplianceReportChart from "@/components/reports/eventFulfillment";
import FacultyExpenseReport from "@/components/reports/faculty-expense-report";
import GraficoAlcanceEventosPorFacultad from "@/components/reports/grafico-alcance-eventos-por-facultad";
import GraficoMatriculaUniversitarial from "@/components/reports/grafico-matricula-universitaria";
import FacultyStudentComparisonChart from "@/components/reports/faculty-student-comparison-chart";
import GanttChart from "@/components/reports/gantt/gantt-report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React from "react";

export default function Page() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Reportes Generales</h1>
            <Tabs defaultValue="planificacion" className="w-full">
                {/* Wrapper div for sticky TabsList */}
                <div className="sticky top-16 z-10 bg-background py-2 mb-6 border-b">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        <TabsTrigger value="planificacion">Planificación</TabsTrigger>
                        <TabsTrigger value="estrategia">Alineación Estratégica</TabsTrigger>
                        <TabsTrigger value="finanzas">Finanzas y Presupuesto</TabsTrigger>
                        <TabsTrigger value="ejecucion">Ejecución y Cumplimiento</TabsTrigger>
                        <TabsTrigger value="estudiantes">Datos Estudiantes</TabsTrigger>
                    </TabsList>
                </div>

                {/* 1. Planificación y Cronograma */}
                <TabsContent value="planificacion" className="space-y-6 mt-4">
                    <GanttChart />
                </TabsContent>

                {/* 2. Alineación Estratégica (POA y ODS) */}
                <TabsContent value="estrategia" className="space-y-6 mt-4">
                    <GraficoPOA />
                    <PoaCostChart />
                    <GraficoODS />
                </TabsContent>

                {/* 3. Finanzas y Presupuesto */}
                <TabsContent value="finanzas" className="space-y-6 mt-4">
                    <CostByFaculty />
                    <FacultyExpenseReport />
                    <FacultyStudentComparisonChart />
                </TabsContent>

                {/* 4. Ejecución y Cumplimiento de Eventos */}
                <TabsContent value="ejecucion" className="space-y-6 mt-4">
                    <GraficoAlcanceEventosPorFacultad />
                    <ComplianceReportChart />
                </TabsContent>

                {/* 5. Datos de Estudiantes */}
                <TabsContent value="estudiantes" className="space-y-6 mt-4">
                    <GraficoMatriculaUniversitarial />
                    {/* FacultyStudentComparisonChart podría ir aquí también, pero lo dejé en Finanzas */}
                </TabsContent>
            </Tabs>
        </div>
    );
}