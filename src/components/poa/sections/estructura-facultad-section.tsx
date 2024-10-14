"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Edit, Trash2, PlusCircle, Pencil, Save } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from "@/components/ui/checkbox"

import { departmentApi, Department } from '@/api/department'
import { campusApi, Campus } from '@/api/campus'
import { programApi, Program } from '@/api/program'
import { facultyApi } from '@/api/faculty'

interface FacultyStructureSectionProps {
  name: string;
  isActive: boolean;
  facultyId: number;
}

export function FacultyStructureSection({ name, isActive, facultyId }: FacultyStructureSectionProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allCampuses, setAllCampuses] = useState<Campus[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [newDepartment, setNewDepartment] = useState<Omit<Department, 'departmentId'>>({ name: '', director: '', facultyId: Number(facultyId) });
  const [newCampus, setNewCampus] = useState<Omit<Campus, 'campusId'>>({ name: '', city: '', department: '', currentStudentCount: 0 });
  const [newProgram, setNewProgram] = useState<Omit<Program, 'programId'>>({ name: '', director: '', campusIds: [] });
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isCampusDialogOpen, setIsCampusDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isAddExistingCampusDialogOpen, setIsAddExistingCampusDialogOpen] = useState(false);
  const [isAddExistingProgramDialogOpen, setIsAddExistingProgramDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [selectedExistingCampusId, setSelectedExistingCampusId] = useState<number>();
  const [selectedExistingProgramId, setSelectedExistingProgramId] = useState<number>();
  const [selectedCampuses, setSelectedCampuses] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, [facultyId]);

  const fetchAllData = async () => {
    try {
      const [departmentsData, campusesData, programsData, allCampusesData, allProgramsData] = await Promise.all([
        departmentApi.getAllDepartments(facultyId),
        campusApi.getCampusByFaculty(facultyId),
        programApi.getProgramsByFaculty(facultyId),
        campusApi.getAllCampuses(),
        programApi.getAllPrograms(),
      ]);
      setDepartments(departmentsData);
      setCampuses(campusesData);
      setPrograms(programsData);
      setAllCampuses(allCampusesData);
      setAllPrograms(allProgramsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron cargar los datos. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => setIsEditing(!isEditing);

  const handleSave = () => {
    setIsEditing(false);
    fetchAllData();
  };

  const handleAddDepartment = () => {
    setNewDepartment({ name: '', director: '', facultyId: Number(facultyId) });
    setEditMode('create');
    setIsDepartmentDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setNewDepartment(department);
    setEditMode('edit');
    setEditItemId(department.departmentId);
    setIsDepartmentDialogOpen(true);
  };

  const handleConfirmDepartment = async () => {
    try {
      if (editMode === 'create') {
        await departmentApi.createDepartment(newDepartment);
      } else {
        await departmentApi.updateDepartment(editItemId!, newDepartment);
      }
      setIsDepartmentDialogOpen(false);
      fetchAllData();
      toast({
        title: editMode === 'create' ? "Departamento creado" : "Departamento actualizado",
        description: "La operación se completó con éxito.",
      });
    } catch (error) {
      console.error('Failed to save department:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el departamento. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await departmentApi.deleteDepartment(id);
      fetchAllData();
      toast({
        title: "Departamento eliminado",
        description: "El departamento se eliminó con éxito.",
      });
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el departamento. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleAddCampus = () => {
    setNewCampus({ name: '', city: '', department: '', currentStudentCount: 0 });
    setEditMode('create');
    setIsCampusDialogOpen(true);
  };

  const handleEditCampus = (campus: Campus) => {
    setNewCampus(campus);
    setEditMode('edit');
    setEditItemId(campus.campusId);
    setIsCampusDialogOpen(true);
  };

  const handleConfirmCampus = async () => {
    try {
      if (editMode === 'create') {
        const createdCampus = await campusApi.createCampus(newCampus);
        await facultyApi.addCampusToFaculty(facultyId, createdCampus.campusId);
      } else {
        await campusApi.updateCampus(editItemId!, newCampus);
      }
      setIsCampusDialogOpen(false);
      fetchAllData();
      toast({
        title: editMode === 'create' ? "Sede creada" : "Sede actualizada",
        description: "La operación se completó con éxito.",
      });
    } catch (error) {
      console.error('Failed to save campus:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la sede. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCampus = async (id: number) => {
    try {
      await campusApi.deleteCampus(id);
      fetchAllData();
      toast({
        title: "Sede eliminada",
        description: "La sede se eliminó con éxito.",
      });
    } catch (error) {
      console.error('Failed to delete campus:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la sede. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleAddProgram = () => {
    setNewProgram({ name: '', director: '', campusIds: [] });
    setSelectedCampuses([]);
    setEditMode('create');
    setIsProgramDialogOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setNewProgram(program);
    setEditMode('edit');
    setEditItemId(program.programId);
    setSelectedCampuses(program.campusIds);
    setIsProgramDialogOpen(true);
  };

  const handleConfirmProgram = async () => {
    try {
      if (editMode === 'create') {
        const createdProgram = await programApi.createProgram(newProgram);
        await facultyApi.addProgramToFaculty(facultyId, createdProgram.programId);
        await programApi.addCampusesToProgram(createdProgram.programId, selectedCampuses);
      } else {
        await programApi.updateProgram(editItemId!, newProgram);
        await programApi.addCampusesToProgram(editItemId!, selectedCampuses);
      }
      setIsProgramDialogOpen(false);
      fetchAllData();
      toast({
        title: editMode === 'create' ? "Carrera creada" : "Carrera actualizada",
        description: "La operación se completó con éxito.",
      });
    } catch (error) {
      console.error('Failed to save program:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la carrera. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProgram = async (id: number) => {
    try {
      await programApi.deleteProgram(id);
      fetchAllData();
      toast({
        title: "Carrera eliminada",
        description: "La carrera se eliminó con éxito.",
      });
    } catch (error) {
      console.error('Failed to delete program:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la carrera. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleAddExistingCampus = () => {
    setSelectedExistingCampusId(undefined);
    setIsAddExistingCampusDialogOpen(true);
  };

  const handleConfirmAddExistingCampus = async () => {
    try {
      if (!selectedExistingCampusId) {
        throw new Error('Campus ID is required');
      }
      await facultyApi.addCampusToFaculty(facultyId, selectedExistingCampusId);
      setIsAddExistingCampusDialogOpen(false);
      fetchAllData();
      toast({
        title: "Sede agregada",
        description: "La sede se agregó con éxito a la facultad.",
      });
    } catch (error) {
      console.error('Failed to add existing campus:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la sede a la facultad. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleAddExistingProgram = () => {
    setSelectedExistingProgramId(undefined);
    setSelectedCampuses([]);
    setIsAddExistingProgramDialogOpen(true);
  };

  const handleConfirmAddExistingProgram = async () => {
    try {
      if (!selectedExistingProgramId) {
        throw new Error('Program ID is required');
      }
      await facultyApi.addProgramToFaculty(facultyId, selectedExistingProgramId);
      await programApi.addCampusesToProgram(selectedExistingProgramId, selectedCampuses);
      setIsAddExistingProgramDialogOpen(false);
      fetchAllData();
      toast({
        title: "Carrera agregada",
        description: "La carrera se agregó con éxito a la facultad.",
      });
    } catch (error) {
      console.error('Failed to add existing program:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la carrera a la facultad. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div id={name} className="mb-6">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
        <div className="p-4 bg-green-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-green-800">{name}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleEdit} className="text-green-700 hover:text-green-800 hover:bg-green-100">
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-green-700 hover:text-green-800 hover:bg-green-100">
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="space-y-6">
              {/* Departments Section */}
              <div>
                <h3 className="text-lg font-medium mb-2 text-green-700">Departamentos de la Facultad</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-green-700">Nombre</TableHead>
                      <TableHead className="text-green-700">Director</TableHead>
                      <TableHead className="text-green-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.departmentId}>
                        <TableCell>{department.name}</TableCell>
                        <TableCell>{department.director}</TableCell>
                        <TableCell>
                          {isEditing && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditDepartment(department)}
                                className="text-green-700  hover:text-green-800 hover:bg-green-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteDepartment(department.departmentId)}
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  variant="outline"
                  onClick={handleAddDepartment}
                  className={`mt-4 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${isEditing ? '' : 'hidden'}`}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Departamento
                </Button>
              </div>

              {/* Campuses Section */}
              <div>
                <h3 className="text-lg font-medium mb-2 text-green-700">Sedes de la Facultad</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-green-700">Nombre</TableHead>
                      <TableHead className="text-green-700">Ciudad</TableHead>
                      <TableHead className="text-green-700">Departamento</TableHead>
                      <TableHead className="text-green-700">Estudiantes</TableHead>
                      <TableHead className="text-green-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campuses.map((campus) => (
                      <TableRow key={campus.campusId}>
                        <TableCell>{campus.name}</TableCell>
                        <TableCell>{campus.city}</TableCell>
                        <TableCell>{campus.department}</TableCell>
                        <TableCell>{campus.currentStudentCount}</TableCell>
                        <TableCell>
                          {isEditing && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditCampus(campus)}
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteCampus(campus.campusId)}
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleAddCampus}
                    className={`bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${isEditing ? '' : 'hidden'}`}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar nueva Sede
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddExistingCampus}
                    className={`bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${isEditing ? '' : 'hidden'}`}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar Sede Existente
                  </Button>
                </div>
              </div>

              {/* Programs Section */}
              <div>
                <h3 className="text-lg font-medium mb-2 text-green-700">Carreras de la Facultad</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-green-700">Nombre</TableHead>
                      <TableHead className="text-green-700">Director</TableHead>
                      <TableHead className="text-green-700">Sedes</TableHead>
                      <TableHead className="text-green-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.programId}>
                        <TableCell>{program.name}</TableCell>
                        <TableCell>{program.director}</TableCell>
                        <TableCell>{program.campusIds}</TableCell>
                        <TableCell>
                          {isEditing && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditProgram(program)}
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteProgram(program.programId)}
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleAddProgram}
                    className={`bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${isEditing ? '' : 'hidden'}`}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar nueva carrera
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddExistingProgram}
                    className={`bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${isEditing ? '' : 'hidden'}`}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar carrera existente
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSave}
                className={`mt-4 bg-green-600 text-white hover:bg-green-700 ${isEditing ? '' : 'hidden'}`}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Department Dialog */}
      <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">{editMode === 'create' ? "Agregar Departamento" : "Editar Departamento"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departmentName" className="text-right text-green-700">
                Nombre
              </Label>
              <Input
                id="departmentName"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departmentDirector" className="text-right text-green-700">
                Director
              </Label>
              <Input
                id="departmentDirector"
                value={newDepartment.director}
                onChange={(e) => setNewDepartment({ ...newDepartment, director: e.target.value })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
          </div>
          <Button onClick={handleConfirmDepartment} className="bg-green-600 text-white hover:bg-green-700">
            {editMode === 'create' ? "Agregar Departamento" : "Guardar Cambios"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Campus Dialog */}
      <Dialog open={isCampusDialogOpen} onOpenChange={setIsCampusDialogOpen}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">{editMode === 'create' ? "Agregar Sede" : "Editar Sede"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campusName" className="text-right text-green-700">
                Nombre
              </Label>
              <Input
                id="campusName"
                value={newCampus.name}
                onChange={(e) => setNewCampus({ ...newCampus, name: e.target.value })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campusCity" className="text-right text-green-700">
                Ciudad
              </Label>
              <Input
                id="campusCity"
                value={newCampus.city}
                onChange={(e) => setNewCampus({ ...newCampus, city: e.target.value })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campusDepartment" className="text-right text-green-700">
                Departamento
              </Label>
              <Input
                id="campusDepartment"
                value={newCampus.department}
                onChange={(e) => setNewCampus({ ...newCampus, department: e.target.value })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campusStudentCount" className="text-right text-green-700">
                Estudiantes
              </Label>
              <Input
                id="campusStudentCount"
                type="number"
                value={newCampus.currentStudentCount}
                onChange={(e) => setNewCampus({ ...newCampus, currentStudentCount: parseInt(e.target.value) || 0 })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
          </div>
          <Button onClick={handleConfirmCampus} className="bg-green-600 text-white hover:bg-green-700">
            {editMode === 'create' ? "Agregar Sede" : "Guardar Cambios"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Program Dialog */}
      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">{editMode === 'create' ? "Agregar carrera" : "Editar carrera"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programName" className="text-right text-green-700">
                Nombre
              </Label>
              <Input
                id="programName"
                value={newProgram.name}
                onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programDirector" className="text-right text-green-700">
                Director
              </Label>
              <Input
                id="programDirector"
                value={newProgram.director}
                onChange={(e) => setNewProgram({ ...newProgram, director: e.target.value })}
                className="col-span-3 border-green-300 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-green-700">
                Sedes
              </Label>
              <div className="col-span-3 space-y-2">
                {campuses.map((campus) => (
                  <div key={campus.campusId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`campus-${campus.campusId}`}
                      checked={selectedCampuses.includes(campus.campusId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCampuses([...selectedCampuses, campus.campusId]);
                        } else {
                          setSelectedCampuses(selectedCampuses.filter(id => id !== campus.campusId));
                        }
                      }}
                    />
                    <Label htmlFor={`campus-${campus.campusId}`}>{campus.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleConfirmProgram} className="bg-green-600 text-white hover:bg-green-700">
            {editMode === 'create' ? "Agregar carrera" : "Guardar Cambios"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Existing Campus Dialog */}
      <Dialog open={isAddExistingCampusDialogOpen} onOpenChange={setIsAddExistingCampusDialogOpen}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">Agregar Sede Existente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="existingCampus" className="text-right text-green-700">
                Sede
              </Label>
              <Select onValueChange={(value) => setSelectedExistingCampusId(Number(value))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar sede" />
                </SelectTrigger>
                <SelectContent>
                  {allCampuses
                    .filter(campus => !campuses.some(c => c.campusId === campus.campusId))
                    .map((campus) => (
                      <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                        {campus.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleConfirmAddExistingCampus} className="bg-green-600 text-white hover:bg-green-700">
            Agregar Sede
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Existing Program Dialog */}
      <Dialog open={isAddExistingProgramDialogOpen} onOpenChange={setIsAddExistingProgramDialogOpen}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">Agregar carrera Existente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="existingProgram" className="text-right text-green-700">
                carrera
              </Label>
              <Select onValueChange={(value) => setSelectedExistingProgramId(Number(value))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  {allPrograms
                    .filter(program => !programs.some(p => p.programId === program.programId))
                    .map((program) => (
                      <SelectItem key={program.programId} value={program.programId.toString()}>
                        {program.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-green-700">
                Sedes
              </Label>
              <div className="col-span-3 space-y-2">
                {campuses.map((campus) => (
                  <div key={campus.campusId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`campus-${campus.campusId}`}
                      checked={selectedCampuses.includes(campus.campusId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCampuses([...selectedCampuses, campus.campusId]);
                        } else {
                          setSelectedCampuses(selectedCampuses.filter(id => id !== campus.campusId));
                        }
                      }}
                    />
                    <Label htmlFor={`campus-${campus.campusId}`}>{campus.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleConfirmAddExistingProgram} className="bg-green-600 text-white hover:bg-green-700">
            Agregar carrera
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}