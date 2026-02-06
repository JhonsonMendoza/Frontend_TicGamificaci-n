/**
 * Formatea un nombre completo para mostrar solo el primer nombre
 * y la inicial del segundo (si existe).
 * 
 * Ejemplos:
 * - "JUAN CARLOS PEREZ GOMEZ" -> "Juan C."
 * - "MARIA JOSE" -> "Maria J."
 * - "PEDRO" -> "Pedro"
 * - "juan pablo" -> "Juan P."
 * 
 * @param fullName - El nombre completo del usuario
 * @returns El nombre formateado
 */
export function formatDisplayName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'Usuario';
  }

  // Limpiar espacios extras y dividir por espacios
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 0) {
    return 'Usuario';
  }

  // Función auxiliar para capitalizar correctamente
  const capitalize = (word: string): string => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  // Si solo hay un nombre
  if (nameParts.length === 1) {
    return capitalize(nameParts[0]);
  }

  // Si hay dos o más nombres, tomar el primero completo y la inicial del segundo
  const firstName = capitalize(nameParts[0]);
  const secondInitial = nameParts[1].charAt(0).toUpperCase();
  
  return `${firstName} ${secondInitial}.`;
}

/**
 * Obtiene la inicial del nombre para mostrar en avatares
 * @param fullName - El nombre completo del usuario
 * @returns La primera letra del nombre en mayúscula
 */
export function getNameInitial(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'U';
  }

  const cleaned = fullName.trim();
  return cleaned.charAt(0).toUpperCase();
}
