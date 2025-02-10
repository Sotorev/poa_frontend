import CostByFaculty from "@/components/reports/costByFaculty";
import GraficoODS from "@/components/reports/GraficoODS";
import GraficoPOA from "@/components/reports/GraficoPOA";
import PoaCostChart from "@/components/reports/costByObjective";
import ComplianceReportChart from "@/components/reports/eventFulfillment";
import FacultyExpenseReport from "@/components/reports/faculty-expense-report";
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
        </>
    );
}