import { PROYECTO } from './proyecto'

export default function Acerca() {
  const { autor, documento, taller, dominio, fuente, tecnologias, herramientaExtra } = PROYECTO

  return (
    <section>
      <h2>ℹ️Acerca del proyecto</h2>

      <div className="panel">
        <h3>Autor</h3>
        <dl className="ficha">
          <dt>Nombre</dt><dd>{autor}</dd>
          <dt>Documento</dt><dd>{documento}</dd>
          <dt>Taller</dt><dd>{taller}</dd>
        </dl>
      </div>

      <div className="panel">
        <h3>Sobre los datos</h3>
        <dl className="ficha">
          <dt>Dominio</dt><dd>{dominio}</dd>
          <dt>Fuente</dt>
          <dd><a href={fuente.url} target="_blank" rel="noreferrer">{fuente.nombre}</a></dd>
        </dl>
        <div className="etiquetas">
          {tecnologias.map((t) => <span key={t} className="etiqueta-tec">{t}</span>)}
        </div>
      </div>

      <div className="panel destacado">
        <span className="insignia nueva">Herramienta nueva</span>
        <h3>{herramientaExtra.nombre}</h3>
        <p>{herramientaExtra.descripcion}</p>
        <ul>
          {herramientaExtra.puntos.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
    </section>
  )
}