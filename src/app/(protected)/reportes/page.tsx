import CostByFaculty from "@/components/reports/costByFaculty";
import GraficoODS from "@/components/reports/GraficoODS";
import GraficoPOA from "@/components/reports/GraficoPOA";
import React from "react";

export default function Page() {
    return (
        <>
            <GraficoODS />
            <GraficoPOA />
            <CostByFaculty />
        </>
    );
}