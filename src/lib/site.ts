// El origin derivado de `req.url` no es confiable detrás del proxy/CDN de
// Netlify (a veces resuelve a una URL interna del deploy en vez del dominio
// público), y eso rompe cosas que necesitan una URL exacta y estable como el
// redirect_uri de Google OAuth. Por eso usamos una URL fija por entorno.
export function siteUrl(): string {
  return process.env.SITE_URL || "http://localhost:3000";
}
