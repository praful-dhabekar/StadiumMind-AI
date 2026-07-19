import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders title, subtitle, and body children', () => {
    render(
      <Card title="Gate A Summary" subtitle="Plaza North">
        <div>Content Body</div>
      </Card>
    );

    expect(screen.getByText('Gate A Summary')).toBeInTheDocument();
    expect(screen.getByText('Plaza North')).toBeInTheDocument();
    expect(screen.getByText('Content Body')).toBeInTheDocument();
  });

  it('renders action element in header if provided', () => {
    render(
      <Card title="Incident Alert" action={<button>Action Button</button>}>
        <div>Details</div>
      </Card>
    );

    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });
});
