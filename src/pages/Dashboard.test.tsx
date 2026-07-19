import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import * as realtimeHook from '../hooks/useStadiumRealtimeData';

vi.mock('../hooks/useStadiumRealtimeData');

describe('Dashboard Component Rendering', () => {
  it('should render loading skeleton state when isLoading is true', () => {
    vi.spyOn(realtimeHook, 'useStadiumRealtimeData').mockReturnValue({
      gates: [],
      parking: [],
      volunteers: [],
      incidents: [],
      restrooms: [],
      isLoading: true,
      isError: false,
      error: null,
    });

    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render error state when isError is true', () => {
    vi.spyOn(realtimeHook, 'useStadiumRealtimeData').mockReturnValue({
      gates: [],
      parking: [],
      volunteers: [],
      incidents: [],
      restrooms: [],
      isLoading: false,
      isError: true,
      error: new Error('Firestore Connection Error'),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Firestore Realtime Disconnected/i)).toBeInTheDocument();
  });

  it('should render all 6 required dashboard cards with live metrics when loaded', () => {
    vi.spyOn(realtimeHook, 'useStadiumRealtimeData').mockReturnValue({
      gates: [
        {
          id: 'A',
          name: 'Gate A',
          status: 'OPEN',
          waitTime: 10,
          crowdLevel: 'LOW',
          queueLength: 50,
          capacity: 1000,
          currentOccupancy: 300,
          languages: ['English'],
        },
      ],
      parking: [
        {
          id: 'Lot-A',
          available: 100,
          total: 200,
          status: 'AVAILABLE',
        },
      ],
      volunteers: [
        {
          id: 'VOL-001',
          name: 'Volunteer 1',
          zone: 'Gate A',
          available: true,
          languages: ['English'],
        },
      ],
      incidents: [
        {
          id: 'INC-100',
          type: 'Medical',
          severity: 'Medium',
          location: 'Gate A',
          status: 'Open',
          timestamp: new Date().toISOString(),
        },
      ],
      restrooms: [
        {
          id: 'R-A1',
          location: 'North Wing',
          occupancy: 40,
          status: 'Available',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Verify 6 card titles
    expect(screen.getByText('Open Gates')).toBeInTheDocument();
    expect(screen.getByText('Average Wait Time')).toBeInTheDocument();
    expect(screen.getByText('Active Incidents')).toBeInTheDocument();
    expect(screen.getByText('Available Volunteers')).toBeInTheDocument();
    expect(screen.getByText('Parking Availability')).toBeInTheDocument();
    expect(screen.getByText('Restroom Occupancy')).toBeInTheDocument();
  });
});
