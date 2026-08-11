import { GoogleGenerativeAI } from "@google/generative-ai"; 

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set — AI calls will fail.");
}
 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
 
// flash is fast + free-tier friendly, good fit for classify/draft calls
export const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
