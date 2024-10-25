"use client";
import { usePermissions } from "@/hooks/use-permissions";
import { ProtectedRoute } from "../../_components/protected-route";
import ProtectedRolesManagement from "../_components/roles-management";
import React from 'react'

function RolesPage() {
	return (
		<ProtectedRoute action="View" moduleName="Auth">
			<ProtectedRolesManagement />
		</ProtectedRoute>
	)
}

export default RolesPage