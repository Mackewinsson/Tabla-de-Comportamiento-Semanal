
import { GoogleGenAI } from "@google/genai";
import { DAYS_OF_WEEK } from "../constants";
import type { Task } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getBehaviorFeedback(name: string, scores: number[], tasks?: Task[]): Promise<string> {
  const formattedScores = DAYS_OF_WEEK.map((day, index) => {
    const score = scores[index];
    let label = 'Sin evaluar / No puntuado';
    if (score === 1) label = 'Todo hecho o conducta excelente (1 estrella / 10 pts)';
    if (score === 0.5) label = 'Cumplimiento medio o parcial (Media estrella / 5 pts)';
    if (score === -1) label = '¡A mejorar! / Necesita reforzarse (Ups / -10 pts)';
    return `- ${day}: ${label}`;
  }).join('\n');

  let tasksDescription = 'No hay tareas asignadas todavía para esta semana.';
  if (tasks && tasks.length > 0) {
    tasksDescription = tasks.map(task => {
      const assignedDaysStr = task.days.map(d => DAYS_OF_WEEK[d]).join(', ');
      const completedDaysList = Object.keys(task.completed)
        .filter(k => task.completed[Number(k)])
        .map(k => DAYS_OF_WEEK[Number(k)]);
      
      const completedDaysStr = completedDaysList.length > 0 ? completedDaysList.join(', ') : 'ninguno';
      const completedCount = Object.keys(task.completed).filter(k => task.completed[Number(k)] && task.days.includes(Number(k))).length;
      const assignedCount = task.days.length;
      
      return `- Tarea: "${task.title}" (Asignada: ${assignedDaysStr}). Completada ${completedCount} de ${assignedCount} veces (Días completados: ${completedDaysStr}).`;
    }).join('\n');
  }

  const prompt = `
    Eres un psicólogo infantil amigable y experto en refuerzo positivo. Tu tarea es analizar el comportamiento semanal y el cumplimiento de tareas de un niño/a y proporcionar un resumen alentador y constructivo para sus padres.

    Nombre del niño/a: ${name}

    Puntuaciones de la conducta general de la semana. Los padres evalúan cada día con estos valores numéricos:
    - 1: "Todo hecho" / conducto óptima (Puntuación máxima de 1 estrella)
    - 0.5: "Medio" / esfuerzo o cumplimiento parcial (Media estrella)
    - 0: "Sin evaluar"
    - -1: "¡A mejorar!" / comportamiento difícil o retroceso (Un momento donde se necesita reforzar el esfuerzo)
    
    Puntos diarios: ${formattedScores}

    Cumplimiento de tareas asignadas esta semana:
    ${tasksDescription}

    Por favor, escribe un párrafo corto (no más de 4-5 frases) en español que:
    1. Comience de forma muy positiva, reconociendo el esfuerzo general de ${name} y celebrando las tareas que ha completado con éxito.
    2. Destaque los logros específicos (días excelentes de "Todo hecho", cumplimiento medio o tareas realizadas con alta constancia).
    3. Si hay días con "¡A mejorar!" o tareas con bajo cumplimiento, proporciona una sugerencia o recordatorio muy amigable, pedagógico y constructivo para motivar al niño sin ser crítico, enfocado en el refuerzo positivo.
    4. Termine con una nota inspiradora y de apoyo para los padres de cara a la próxima semana.
    5. Mantenga un tono cálido, comprensivo y profesional, dirigiéndose directamente a los padres.
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
    });
    return response.text || "No se pudo obtener feedback en este momento.";
  } catch (error) {
    console.error("Error fetching feedback from Gemini API:", error);
    throw new Error("Failed to generate feedback. Please check the API configuration.");
  }
}
