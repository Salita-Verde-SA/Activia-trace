import React, { useState, useEffect } from 'react';
import { useUmbral, useSetUmbral } from '../hooks/useCalificaciones';

interface UmbralPanelProps {
  materiaId: string;
}

export const UmbralPanel: React.FC<UmbralPanelProps> = ({ materiaId }) => {
  const { data: umbral, isLoading } = useUmbral(materiaId);
  const setUmbralMutation = useSetUmbral();
  
  const [pct, setPct] = useState<number | "">("");
  const [valoresTxt, setValoresTxt] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (umbral) {
      setPct(umbral.umbral_pct !== null && umbral.umbral_pct !== undefined ? umbral.umbral_pct : "");
      setValoresTxt(umbral.valores_aprobatorios.join(', '));
    }
  }, [umbral]);

  const handleSave = async () => {
    if (pct === "") {
      alert("Por favor ingrese un porcentaje de aprobación válido.");
      return;
    }
    try {
      const valoresArray = valoresTxt.split(',').map(v => v.trim()).filter(v => v);
      await setUmbralMutation.mutateAsync({
        materia_id: materiaId,
        umbral_pct: Number(pct),
        valores_aprobatorios: valoresArray
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando umbral', error);
      alert('Error al guardar el umbral');
    }
  };

  if (isLoading) return <div>Cargando umbral...</div>;

  return (
    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white/10 mb-6">
      <h3 className="text-lg font-serif text-white/90 mb-2">Configuración de Aprobación</h3>
      <p className="text-sm text-white/70 mb-4">
        Ajusta el porcentaje necesario para aprobar actividades numéricas, y los valores exactos para aprobar actividades textuales.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Porcentaje de Aprobación (%)</label>
          <input 
            type="number" 
            min="0" max="100" 
            value={pct === "" ? "" : pct} 
            onChange={(e) => setPct(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-black/20 border-white/10 rounded-md text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Valores Textuales (separados por coma)</label>
          <input 
            type="text" 
            value={valoresTxt} 
            onChange={(e) => setValoresTxt(e.target.value)}
            placeholder="A, B, Excelente, Muy Bueno"
            className="w-full bg-black/20 border-white/10 rounded-md text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 placeholder:text-white/30"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={setUmbralMutation.isPending || isSuccess}
          className={`px-4 py-2 rounded-md transition-colors shadow-sm disabled:opacity-50 ${
            isSuccess 
              ? 'bg-emerald-600/80 border border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-primary-600/80 border border-primary-500/50 text-white hover:bg-primary-600 shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)]'
          }`}
        >
          {setUmbralMutation.isPending ? 'Guardando...' : isSuccess ? 'Guardado ✓' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};
