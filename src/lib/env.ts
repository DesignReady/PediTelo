/**
 * Detecta si el código corre dentro de una Netlify Function.
 * `NETLIFY` solo está garantizado en tiempo de build; en runtime usamos también
 * las señales que sí están presentes en cada invocación real de la función
 * (Netlify corre sus funciones sobre Lambda).
 */
export const isNetlifyRuntime = Boolean(
  process.env.NETLIFY ||
    process.env.NETLIFY_BLOBS_CONTEXT ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
);
