// Grid de tarjetas de reportes
import TarjetaReporte from './TarjetaReporte';

function ListaReportes({ reportes, alClickReporte }) {
  if (!reportes || reportes.length === 0) {
    return (
      <div className="texto-centro" style={{ padding: '40px', color: 'var(--color-texto-secundario)' }}>
        No hay reportes registrados
      </div>
    );
  }

  return (
    <div className="grid-reportes" id="grid-reportes">
      {reportes.map(reporte => (
        <TarjetaReporte
          key={reporte.id}
          reporte={reporte}
          alClick={alClickReporte}
        />
      ))}
    </div>
  );
}

export default ListaReportes;
