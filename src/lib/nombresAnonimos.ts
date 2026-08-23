// Nombres al estilo "Anonymous Otter" de Google Docs: se asigna uno al azar
// a cada comentario para no exponer el nombre real de la cuenta de Google.
const ADJETIVOS = [
  "Curioso",
  "Discreto",
  "Alegre",
  "Sereno",
  "Audaz",
  "Risueño",
  "Astuto",
  "Amable",
  "Travieso",
  "Sigiloso",
  "Radiante",
  "Veloz",
];

const ANIMALES = [
  "Zorro",
  "Panda",
  "Búho",
  "Koala",
  "Tigre",
  "Delfín",
  "Lobo",
  "Colibrí",
  "Puma",
  "Nutria",
  "Flamenco",
  "Jaguar",
];

export function nombreAnonimo(): string {
  const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
  const animal = ANIMALES[Math.floor(Math.random() * ANIMALES.length)];
  return `${animal} ${adjetivo}`;
}
