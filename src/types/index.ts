import { ReactNode } from 'react';

/**
 * Gate status options in Firestore
 */
export type GateStatus = 'OPEN' | 'CLOSED' | 'CONGESTED';

/**
 * Crowd density level options
 */
export type CrowdLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Firestore Gate document structure
 */
export interface Gate {
  id: string;
  name: string;
  status: GateStatus;
  waitTime: number; // in minutes
  crowdLevel: CrowdLevel;
  queueLength: number;
  capacity: number;
  currentOccupancy: number;
  languages: string[];
}

/**
 * Parking Lot status options in Firestore
 */
export type ParkingStatus = 'AVAILABLE' | 'FULL' | 'LIMITED';

/**
 * Firestore Parking Lot document structure
 */
export interface Parking {
  id: string;
  available: number;
  total: number;
  status: ParkingStatus;
}

/**
 * Firestore Volunteer document structure
 */
export interface Volunteer {
  id: string;
  name: string;
  zone: string;
  available: boolean;
  languages: string[];
}

/**
 * Incident Category Types
 */
export type IncidentType = 'Medical' | 'Crowd' | 'Security' | 'Technical';

/**
 * Incident Severity ratings
 */
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

/**
 * Incident lifecycle status
 */
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved';

/**
 * Firestore Incident document structure
 */
export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: string;
  status: IncidentStatus;
  timestamp: string;
}

/**
 * Restroom status options
 */
export type RestroomStatus = 'Available' | 'Occupied' | 'Cleaning';

/**
 * Firestore Restroom document structure
 */
export interface Restroom {
  id: string;
  location: string;
  occupancy: number; // percentage (0 - 100)
  status: RestroomStatus;
}

/**
 * Badge visual variants
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';

/**
 * Card component props
 */
export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  glassmorphism?: boolean;
  hoverEffect?: boolean;
}

/**
 * Badge component props
 */
export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: ReactNode;
  pulse?: boolean;
}

/**
 * Loading component props
 */
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

/**
 * EmptyState component props
 */
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * ErrorState component props
 */
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}
