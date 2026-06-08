import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AvisosForm } from '../features/avisos/components/AvisosForm';

const mockCrearAviso = vi.fn();

vi.mock('../features/avisos/hooks/useAvisos', () => ({
  useAvisos: () => ({
    crearAviso: {
      mutateAsync: mockCrearAviso,
      isPending: false,
    },
  }),
}));

describe('AvisosForm', () => {
  it('envía los datos correctos de segmentación y ack', async () => {
    const onCancel = vi.fn();
    render(<AvisosForm onCancel={onCancel} />);

    const titulo = screen.getByLabelText(/Título/i);
    const cuerpo = screen.getByLabelText(/Cuerpo/i);
    const btnPublicar = screen.getByRole('button', { name: /Publicar Aviso/i });
    const checkAck = screen.getByLabelText(/Requerir confirmación de lectura/i);
    
    // Selects
    const alcance = screen.getByLabelText(/Alcance/i);
    
    // Dates
    const fechaInicio = screen.getByLabelText(/Fecha Inicio/i);

    fireEvent.change(titulo, { target: { value: 'Aviso Importante' } });
    fireEvent.change(cuerpo, { target: { value: 'Contenido' } });
    fireEvent.change(alcance, { target: { value: 'alumnos' } });
    fireEvent.click(checkAck);
    fireEvent.change(fechaInicio, { target: { value: '2026-03-01' } });

    fireEvent.click(btnPublicar);

    expect(mockCrearAviso).toHaveBeenCalledWith(expect.objectContaining({
      titulo: 'Aviso Importante',
      cuerpo: 'Contenido',
      alcance: 'alumnos',
      requiere_ack: true,
    }));
  });
});
