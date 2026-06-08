import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CloneAsignacionesModal } from '../features/equipos/components/CloneAsignacionesModal';

const mockClonar = vi.fn();

vi.mock('../features/equipos/hooks/useEquipos', () => ({
  useEquipos: () => ({
    clonar: {
      mutateAsync: mockClonar,
      isPending: false,
    },
  }),
}));

describe('CloneAsignacionesModal', () => {
  it('no renderiza cuando isOpen es false', () => {
    const { container } = render(
      <CloneAsignacionesModal isOpen={false} onClose={vi.fn()} materiaId="123" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('llama a clonar con los datos correctos', async () => {
    const onClose = vi.fn();
    render(<CloneAsignacionesModal isOpen={true} onClose={onClose} materiaId="123" />);

    const cohorteOrigen = screen.getByPlaceholderText('UUID cohorte previa');
    const cohorteDestino = screen.getByPlaceholderText('UUID cohorte nueva');
    const btnClonar = screen.getByRole('button', { name: /Clonar Equipo/i });

    fireEvent.change(cohorteOrigen, { target: { value: 'cohorte-1' } });
    fireEvent.change(cohorteDestino, { target: { value: 'cohorte-2' } });

    // En el DOM real habría un datepicker
    const inputs = screen.getAllByRole('textbox');
    // Para simplificar, buscamos el input type date que no tiene rol textbox
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2026-03-01' } });
    }

    fireEvent.click(btnClonar);

    expect(mockClonar).toHaveBeenCalledWith(expect.objectContaining({
      materia_id: '123',
      cohorte_id_origen: 'cohorte-1',
      cohorte_id_destino: 'cohorte-2',
    }));
  });
});
