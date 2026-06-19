import { useState, useEffect } from 'react';
import { usePerfil } from '../hooks/usePerfil';

const inputCls = 'w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-white/20';
const selectCls = 'w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none';
const labelCls = 'block text-sm font-medium text-white/70 mb-1';

const GENEROS = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decir'];

export function PerfilPage() {
  const { perfilQuery, actualizarPerfil } = usePerfil();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [cuil, setCuil] = useState('');
  const [cbu, setCbu] = useState('');
  const [aliasCbu, setAliasCbu] = useState('');
  const [banco, setBanco] = useState('');
  const [regional, setRegional] = useState('');
  const [genero, setGenero] = useState('');
  const [esMonotributista, setEsMonotributista] = useState<boolean | null>(null);
  const [identificadorProfesional, setIdentificadorProfesional] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (perfilQuery.data) {
      const p = perfilQuery.data;
      setNombre(p.nombre ?? '');
      setApellido(p.apellido ?? '');
      setDni(p.dni ?? '');
      setCuil(p.cuil ?? '');
      setCbu(p.cbu ?? '');
      setAliasCbu(p.alias_cbu ?? '');
      setBanco(p.banco ?? '');
      setRegional(p.regional ?? '');
      setGenero(p.genero ?? '');
      setEsMonotributista(p.es_monotributista ?? null);
      setIdentificadorProfesional(p.identificador_profesional ?? '');
    }
  }, [perfilQuery.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    actualizarPerfil.mutate(
      {
        nombre,
        apellido,
        dni: dni || null,
        cuil: cuil || null,
        cbu: cbu || null,
        alias_cbu: aliasCbu || null,
        banco: banco || null,
        regional: regional || null,
        genero: genero || null,
        es_monotributista: esMonotributista,
        identificador_profesional: identificadorProfesional || null,
      },
      {
        onSuccess: () => setSuccessMsg('Perfil actualizado correctamente.'),
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            'Error al actualizar el perfil.';
          setErrorMsg(msg);
        },
      }
    );
  };

  if (perfilQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  const perfil = perfilQuery.data;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Mi Perfil</h1>
        <p className="mt-1 text-sm text-white/70">
          Actualizá tus datos personales y bancarios.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm p-6 space-y-6">
        {/* Solo lectura: email y legajo */}
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
            Datos de identidad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadOnlyField label="Email" value={perfil?.email ?? ''} />
            <ReadOnlyField label="Legajo" value={perfil?.legajo ?? '—'} />
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Formulario editable */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos personales */}
          <div>
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
              Datos personales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Apellido</label>
                <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>DNI</label>
                <input type="text" value={dni} onChange={e => setDni(e.target.value)} maxLength={50} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>CUIL</label>
                <input type="text" value={cuil} onChange={e => setCuil(e.target.value)} maxLength={50} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Género</label>
                <select value={genero} onChange={e => setGenero(e.target.value)} className={selectCls}>
                  <option value="">Sin especificar</option>
                  {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Identificador profesional</label>
                <input type="text" value={identificadorProfesional} onChange={e => setIdentificadorProfesional(e.target.value)} maxLength={100} placeholder="Ej: matrícula, CPN, etc." className={inputCls} />
              </div>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Datos bancarios */}
          <div>
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
              Datos bancarios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>CBU</label>
                <input type="text" value={cbu} onChange={e => setCbu(e.target.value)} maxLength={50} placeholder="22 dígitos" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Alias CBU</label>
                <input type="text" value={aliasCbu} onChange={e => setAliasCbu(e.target.value)} maxLength={255} placeholder="alias.banco.ejemplo" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Banco</label>
                <input type="text" value={banco} onChange={e => setBanco(e.target.value)} maxLength={100} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Regional</label>
                <input type="text" value={regional} onChange={e => setRegional(e.target.value)} maxLength={100} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Modalidad de cobro</label>
                <select
                  value={esMonotributista === null ? '' : esMonotributista ? 'true' : 'false'}
                  onChange={e => {
                    const v = e.target.value;
                    setEsMonotributista(v === '' ? null : v === 'true');
                  }}
                  className={selectCls}
                >
                  <option value="">Sin especificar</option>
                  <option value="true">Factura (monotributista)</option>
                  <option value="false">Liquidación</option>
                </select>
              </div>
            </div>
          </div>

          {successMsg && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={actualizarPerfil.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600/80 hover:bg-primary-600 border border-primary-500/50 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actualizarPerfil.isPending && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {actualizarPerfil.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/50 mb-1">{label}</label>
      <p className="text-sm text-white/80 bg-black/10 border border-white/5 rounded-lg px-3 py-2">
        {value}
      </p>
    </div>
  );
}
