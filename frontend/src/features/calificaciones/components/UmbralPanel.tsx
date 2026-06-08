import React, { useState, useEffect } from 'react';
import { useUmbral, useSetUmbral } from '../hooks/useCalificaciones';

interface UmbralPanelProps {
  materiaId: string;
}

export const UmbralPanel: React.FC<UmbralPanelProps> = ({ materiaId }) => {
  const { data: umbral, isLoading } = useUmbral(materiaId);
  const setUmbralMutation = useSetUmbral();
  
  const [pct, setPct] = useState<number>(60);
  const [valoresTxt, setValoresTxt] = useState<string>('');

  useEffect(() => {
    if (umbral) {
      setPct(umbral.umbral_pct);
      setValoresTxt(umbral.valores_aprobatorios.join(', '));
    }
  }, [umbral]);

  const handleSave = async () => {
    try {
      const valoresArray = valoresTxt.split(',').map(v => v.trim()).filter(v => v);
      await setUmbralMutation.mutateAsync({
        materia_id: materiaId,
        umbral_pct: pct,
        valores_aprobatorios: valoresArray
      });
      alert('Umbral guardado correctamente');
    } catch (error) {
      console.error('Error guardando umbral', error);
      alert('Error al guardar el umbral');
    }
  };

  if (isLoading) return <div>Cargando umbral...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 mb-6">
      <h3 className="text-lg font-bold mb-2">Configuración de Aprobación</h3>
      <p className="text-sm text-gray-600 mb-4">
        Ajusta el porcentaje necesario para aprobar actividades numéricas, y los valores exactos para aprobar actividades textuales.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Aprobación (%)</label>
          <input 
            type="number" 
            min="0" max="100" 
            value={pct} 
            onChange={(e) => setPct(Number(e.target.value))}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valores Textuales (separados por coma)</label>
          <input 
            type="text" 
            value={valoresTxt} 
            onChange={(e) => setValoresTxt(e.target.value)}
            placeholder="A, B, Excelente, Muy Bueno"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={setUmbralMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {setUmbralMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};
