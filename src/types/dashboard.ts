// src/types/dashboard.ts

export interface User {
    username: string;
    // Agrega otros campos del usuario si es necesario
  }
  
  export interface Stats {
    completedProjects: number;
    ongoingProjects: number;
    delayedProjects: number;
    upcomingDeadlines: number;
    budgetUtilization: number;
    // Agrega otros campos de estadísticas si es necesario
  }
  
  export interface ContactInfo {
    name: string;
    phone: string;
    email: string;
  }
  
  export interface DashboardComponentProps {
    user: User;
    stats: Stats;
  }
  
  export interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number;
  }
  
  export interface ChartCardProps {
    title: string;
    chart: React.ReactNode;
  }
  
  export interface QuickActionButtonProps {
    icon: React.ReactNode;
    title: string;
  }
  