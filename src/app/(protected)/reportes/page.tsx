import CostByFaculty from "@/components/reports/costByFaculty";
import GraficoODS from "@/components/reports/GraficoODS";
import GraficoPOA from "@/components/reports/GraficoPOA";
import PoaCostChart from "@/components/reports/costByObjective";
import ComplianceReportChart from "@/components/reports/eventFulfillment";
import FacultyExpenseReport from "@/components/reports/faculty-expense-report";
import GraficoAlcanceEventosPorFacultad from "@/components/reports/grafico-alcance-eventos-por-facultad";
import FacultyComparisonChart from "@/components/reports/faculty-comparison-chart";
import GraficoMatriculaUniversitarial from "@/components/reports/grafico-matricula-universitaria";

import React from "react";

export default function Page() {
    return (
        <>
            <GraficoODS />
            <GraficoPOA />
            <CostByFaculty />
            <PoaCostChart />
            <ComplianceReportChart />
            <FacultyExpenseReport />
            <GraficoAlcanceEventosPorFacultad />
            <FacultyComparisonChart />
            <GraficoMatriculaUniversitarial />
        </>
    );
}