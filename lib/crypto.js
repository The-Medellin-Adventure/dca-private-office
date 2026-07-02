// Genera un hash SHA-256 en el navegador para no guardar contraseñas en texto plano.
// Nota: esto es una protección básica de UI, no un sistema de seguridad robusto.
// Ver README.md, sección "Seguridad" para más contexto.
export async function hashPassword(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
