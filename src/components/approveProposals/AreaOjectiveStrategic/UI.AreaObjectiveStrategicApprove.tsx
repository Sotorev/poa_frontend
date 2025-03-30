"use client"

import { useAreaObjectiveStrategicApproval } from './useAreaObjectiveStrategicApproval'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon, ArrowUpDown, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AreaObjectiveStrategicApprove() {
    const {
        proposals,
        loading,
        error,
        sortColumn,
        sortDirection,
        toggleSort,
        handleApproval,
    } = useAreaObjectiveStrategicApproval()

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Propuestas de Áreas y Objetivos Estratégicos</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {loading && (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {!loading && proposals.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No hay propuestas pendientes
                    </div>
                )}

                {!loading && proposals.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead 
                                    className="cursor-pointer"
                                    onClick={() => toggleSort('nameArea')}
                                >
                                    <div className="flex items-center">
                                        Área Estratégica
                                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortColumn === 'nameArea' ? 'opacity-100' : 'opacity-40'}`} />
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="cursor-pointer"
                                    onClick={() => toggleSort('nameObjective')}
                                >
                                    <div className="flex items-center">
                                        Objetivo Estratégico
                                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortColumn === 'nameObjective' ? 'opacity-100' : 'opacity-40'}`} />
                                    </div>
                                </TableHead>
                                <TableHead>Propuesto por</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {proposals.map((proposal) => (
                                <TableRow key={proposal.id}>
                                    <TableCell className="font-medium">
                                        <Input 
                                            value={proposal.nameArea} 
                                            readOnly 
                                            className="border-none bg-transparent"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input 
                                            value={proposal.nameObjective} 
                                            readOnly 
                                            className="border-none bg-transparent"
                                        />
                                    </TableCell>
                                    <TableCell>{proposal.proposedBy}</TableCell>
                                    <TableCell>{new Date(proposal.proposedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            proposal.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {proposal.status === 'pending' ? 'Pendiente' : 
                                            proposal.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {proposal.status === 'pending' && (
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline" 
                                                    size="sm"
                                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                                    onClick={() => handleApproval(proposal.id, true)}
                                                >
                                                    <CheckIcon className="h-4 w-4 mr-1" />
                                                    Aprobar
                                                </Button>
                                                <Button
                                                    variant="outline" 
                                                    size="sm"
                                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                                    onClick={() => handleApproval(proposal.id, false)}
                                                >
                                                    <XIcon className="h-4 w-4 mr-1" />
                                                    Rechazar
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
