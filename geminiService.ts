
import { GoogleGenAI } from "@google/genai";
import { User, Course } from "../types";

export const getSmartAdviceStream = async (
  user: User, 
  availableCourses: Course[], 
  onUpdate: (text: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    คุณคือ TSU Smart Guide ที่ปรึกษาการเรียน ม.ทักษิณ
    นิสิต: ${user.firstName} ${user.lastName} คณะ ${user.faculty} สาขา ${user.major}
    วิชาที่ลงแล้ว: ${user.schedule.map(c => c.name).join(', ')}
    วิชาที่เปิด: ${availableCourses.map(c => `${c.code}: ${c.name}`).join(', ')}

    แนะนำวิชาที่ควรลงถัดไปตามสาขา และให้กำลังใจสั้นๆ เป็นกันเอง (รูปแบบ Markdown)
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
        // ลด thinking budget เพื่อความรวดเร็วในการตอบสนอง
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let fullText = "";
    for await (const chunk of response) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onUpdate(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    onUpdate("ขออภัย ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งครับ");
    return "";
  }
};
