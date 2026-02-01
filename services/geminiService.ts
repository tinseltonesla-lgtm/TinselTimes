
import { GoogleGenAI, Type } from "@google/genai";
import { Gig, Performer, Role } from "../types";

const formatTime = (time: string) => {
  if (!time) return '';
  const [hour, min] = time.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${min} ${ampm}`;
};

export const suggestScheduling = async (gig: Gig, allPerformers: Performer[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const performerData = allPerformers.map(p => {
    const conflicts = p.conflicts.map(c => {
      const dateStr = c.endDate ? `${c.date} to ${c.endDate}` : c.date;
      const timeStr = c.allDay ? ' (All Day)' : ` from ${formatTime(c.startTime || '')} to ${formatTime(c.endTime || '')}`;
      return `${dateStr}${timeStr}`;
    }).join('; ');
    return `- ${p.firstName} ${p.lastName} (Roles: ${p.roles.join(', ')}${p.isSubOnly ? ', SUB ONLY' : ''}), Conflicts: [${conflicts}]`;
  }).join('\n');

  const prompt = `
    Analyze the following caroling gig and a list of performers with their roles and conflicts.
    Suggest a complete lineup (1 Soprano, 1 Alto, 1 Tenor, 1 Bass, 1 Beatboxer) where no performer has a conflict on the gig date and time.
    
    Gig Details:
    Title: ${gig.title}
    Date: ${gig.date}
    Time: ${formatTime(gig.startTime)} - ${formatTime(gig.endTime)}
    
    Performers:
    ${performerData}
    
    Note: Performers have been instructed to include buffer for travel and a 30-minute early arrival requirement in their conflicts. 
    Ensure the suggested performer's conflict ranges do NOT include the gig date and time.
    
    Return the suggested performer IDs for each role.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assignments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  performerId: { type: Type.STRING }
                },
                required: ['role', 'performerId']
              }
            },
            reasoning: { type: Type.STRING }
          },
          required: ['assignments', 'reasoning']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Scheduling Error:", error);
    return null;
  }
};
