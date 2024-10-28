// src/types/Campus.ts

export interface Campus {
    campusId: number;
    name: string;
    city: string;
    department: string;
    currentStudentCount: number;
    isDeleted?: boolean;
  }
  
  export interface CreateCampusInput {
    name: string;
    city: string;
    department: string;
    currentStudentCount: number;
  }
  
  export interface UpdateCampusInput {
    campusId: number;
    name?: string;
    city?: string;
    department?: string;
    currentStudentCount?: number;
  }
  