import { useState } from 'react';
import { usePerfil } from '../context/PerfilContext';
import { useInventario } from '../context/InventarioContext';
import { elegirDeGaleria } from '../services/camara';
export function useMarcaViewModel() {
  const { activo, invitado } = usePerfil();
  const { negocio, guardarMarca, cargando, errorCarga } = useInventario();
  const [form, setForm] = useState(() => ({ ...negocio.marca }));

  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');

  async function elegirLogo() {
    if (!activo || invitado || ocupado) return;
    setOcupado(true);
    setError('');
    try {
      const r = await elegirDeGaleria(activo.id, true);
      if (r.ok) setForm((f) => ({ ...f, logo: r.uri }));
      else if (r.motivo === 'sin-permiso') setError('Habilitá el acceso a la galería para cargar el logo.');
    } catch {
      setError('No pudimos cargar el logo. Probá otra imagen.');
    } finally {
      setOcupado(false);
    }
  }
  async function guardar() {
    if (!activo || invitado || ocupado || errorCarga) return false;
    setOcupado(true);
    setError('');
    try {
      await guardarMarca(form);
      return true;
    } catch {
      setError('No pudimos guardar la marca. Revisá los datos e intentá de nuevo.');
      return false;
    } finally {
      setOcupado(false);
    }
  }
  return {
    form,
    setForm,
    cargando,
    ocupado,
    error,
    elegirLogo,
    guardar,
    puedeGuardar: !cargando && !errorCarga && form.nombre.trim().length >= 2,
  };
}
