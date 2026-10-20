// Se vuelve a montar en cada navegación: la pantalla nueva entra con un
// desplazamiento corto en vez de cambiar en seco.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
