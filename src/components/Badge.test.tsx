import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders badge content correctly', () => {
    render(<Badge variant="success">ACTIVE</Badge>);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('applies pulse indicator when pulse prop is true', () => {
    const { container } = render(
      <Badge variant="error" pulse>
        CRITICAL
      </Badge>
    );
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('renders custom icons', () => {
    render(
      <Badge variant="info" icon={<span data-testid="custom-icon">★</span>}>
        STAR
      </Badge>
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
