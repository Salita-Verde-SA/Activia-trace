import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiquidacionTable } from '../LiquidacionTable';

describe('LiquidacionTable', () => {
  it('renders loading state correctly', () => {
    render(<LiquidacionTable liquidaciones={[]} isLoading={true} />);
    expect(screen.getByText(/Cargando liquidaciones/i)).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<LiquidacionTable liquidaciones={[]} isLoading={false} />);
    expect(screen.getByText(/No hay liquidaciones/i)).toBeInTheDocument();
  });
});
