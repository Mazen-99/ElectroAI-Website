import { GoogleGenerativeAI } from "@google/generative-ai";
import { AVAILABLE_COMPONENTS } from "../data/components.js";
import { AI_EXAMPLES } from "../data/examples.js";
import { safeJSONParse } from "../utils/aiHelper.js";
import { validateCircuit } from "../schemas/circuitSchema.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.My_AI_Key);
const CIRCUITS_DIR = path.join(process.cwd(), "circuts");

// Helper to load and clean circuits from the folder
const loadSavedCircuits = () => {
    try {
        if (!fs.existsSync(CIRCUITS_DIR)) return [];
        const files = fs.readdirSync(CIRCUITS_DIR).filter(f => f.endsWith(".json"));
        return files.map(file => {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, file), "utf-8"));
                const name = content.projectName || file.replace(".json", "");
                
                const components = (content.circuit?.components || []).map(c => {
                    const cleaned = {
                        componentId: c.componentId,
                        x: c.x,
                        y: c.y,
                        rotation: c.rotation || 0,
                        tagIndex: c.tagIndex,
                        label: c.label || "",
                    };
                    if (c.prefix) cleaned.prefix = c.prefix;
                    if (c.delay !== undefined) cleaned.delay = c.delay;
                    if (c.bulbColor) cleaned.bulbColor = c.bulbColor;
                    return cleaned;
                });

                const wires = (content.circuit?.wires || []).map(w => ({
                    id: w.id || `wire_${Math.random().toString(36).substr(2, 9)}`,
                    from: { compId: w.from.compId, portId: w.from.portId },
                    to: { compId: w.to.compId, portId: w.to.portId },
                    midX1: w.midX1,
                    midY1: w.midY1,
                    midY: w.midY,
                    midX2: w.midX2,
                    midY2: w.midY2,
                    orientation: w.orientation
                }));

                return {
                    prompt: `أرسل لي دائرة: ${name}`,
                    circuit: { components, wires }
                };
            } catch (jsonErr) {
                console.error(`Error parsing JSON file ${file}:`, jsonErr);
                return null;
            }
        }).filter(Boolean);
    } catch (err) {
        console.error("Error loading circuits:", err);
        return [];
    }
};

// No more top-level loading


export const generateCircuit = async (req, res) => {
    try {
        const { prompt, currentCircuit } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Lazy load examples to keep server startup lightning fast
        const allExamples = [...AI_EXAMPLES, ...loadSavedCircuits()];
        const formattedExamples = allExamples.map(ex => `
USER REQUEST: ${ex.prompt}
AI RESPONSE: ${JSON.stringify(ex.circuit)}
`).join('\n---\n');

        const SYSTEM_PROMPT = `
You are "ElectroAI Assistant", an expert electrical engineer specializing in Classic Control Circuits (Industrial Standards).
Your task is to generate a circuit diagram JSON that is EXACTLY compatible with the "ElectroAI Simulator" schema.

COMPONENT AVAILABILITY RULE (CRITICAL):
1. I will provide you with a list of AVAILABLE COMPONENTS.
2. If the user request REQUIRES a component that is NOT in the AVAILABLE COMPONENTS list:
   - DO NOT try to substitute it with something else.
   - DO NOT generate a circuit.
   - Instead, the "explanation" field MUST list the required components that are missing.
   - The "explanation" MUST include this exact message (in the user's language):
     - English: "Your circuit requires [Component names] which are not currently available in our components library. Please contact the developer to add them."
     - Arabic: "دائرتك تحتاج إلى [أسماء المكونات] وهي غير متوفرة حالياً في مكتبة المكونات الخاصة بنا. يرجى التواصل مع المطور لإضافتها."
   - In this case, set "circuit" to null.

AVAILABLE COMPONENTS AND THEIR PORT IDs:
${JSON.stringify(AVAILABLE_COMPONENTS, null, 2)}

${allExamples.length > 0 ? `REFERENCE EXAMPLES OF PERFECT LAYOUTS (LEARN FROM THESE):\n${formattedExamples}\n` : ''}

SCHEMA RULES:
1. Components must be in an array called "components".
2. Wires (connections) must be in an array called "wires".
   - Each wire MUST have a unique "id" string.
   - Each wire must have "from" and "to" objects with "compId" and "portId".
   - Wires can optionally have "midX1", "midY1", "midY", "midX2", "midY2" for routing.

3. Each component must have:
   - "id": Unique string (e.g., "comp_1")
   - "componentId": Type name (e.g., "Contactor", "Lamp")
   - "x", "y": Coordinates (0-2000)
   - "rotation": 0 (except Nutral: 180)
   - "tagIndex": number (1, 2, 3...)
   - "label": Engineering label (e.g., "Forward", "Star")
   - "prefix": "K" for Contactor, "R" for Relay, "T" for Timer, "S" for Buttons, "M" for Motor.
   - "bulbColor": "red", "green", "blue", or "yellow" (ONLY for "Lamp" components).
     * USE INDUSTRIAL STANDARDS: Green for Run/On, Red for Stop/Off/Danger, Yellow for Fault/Overload, Blue for Information.

INDUSTRIAL LAYOUT RULES (CRITICAL):
1. CONTROL CIRCUIT (Left to Right Flow):
   - Vertical Levels (Y-Coordinates):
     * PowerLine (L) / CB: y = 530
     * Stop Buttons / Emergency: y = 700
     * Start Buttons / Latches: y = 900
     * Interlocks (NC Contacts): y = 1100
     * Coils (Contactor/Relay/Timer): y = 1485
     * Nutral (N): y = 1780 (Rotation: 180)
   - Horizontal Branches (X-Coordinates):
     * Branches at x = 500, 700, 900, 1100...
     * Latches at x + 140 (e.g., if button is at 500, latch is at 640).

2. POWER CIRCUIT (Top to Bottom):
   - Power Source (3-Phase): y = 530, x = 1500
   - Main Contactors: y = 900
   - Motors: y = 1485
   - ALIGNMENT: In Power circuits, 3-Phase lines (L1, L2, L3) and associated components MUST be placed on the SAME Y-axis. Only the X-coordinate should vary.

3. VISUAL FIDELITY & ROUTING:
   - Study the provided reference examples carefully. Notice how wires are routed and how components are spaced.
   - Ensure the overall shape of the circuit is clean and professional.
   - Use LOGICAL and CONCISE labels (e.g., "Main", "Forward", "L1", "Start"). Avoid long text.

4. LATCHING & INTERLOCKS:
   - A Latch (NOContact) must be in parallel with its Start button (same y, x + 150).
   - An Interlock (NCContact) must be in series above the Coil it protects.

ELECTRICAL SAFETY & SHORT CIRCUITS (MANDATORY):
- NEVER connect a Line (L1, L2, L3) directly to Neutral (N) or another Line without a LOAD (Coil, Lamp, Motor) in between. 
- A "Short Circuit" (قفلة) occurs if current flows from Line to Neutral through only wires/switches. This is a FATAL error.
- STAR-DELTA CIRCUITS: These are complex. You MUST copy the exact connections from the "Star Delta" reference example. Do NOT try to rewire it yourself. Pay special attention to how K1 (Main), K2 (Star), and K3 (Delta) are interconnected.

5. POWER CIRCUIT COMPLETENESS (STRICT):
   - Every motor circuit MUST include a full Power Circuit.
   - A Power Circuit MUST have: 3-Phase source (L1, L2, L3) -> Circuit Breaker -> Contactor Main Contacts -> Motor.
   - For Star-Delta: You MUST connect the Star contactor to the Motor's end-terminals and the Delta contactor in parallel for the phase shift.
   - NEVER skip the Power wires just because the Control circuit is complex. 
   - A circuit without Power wires is UNUSABLE.
- If provided with a "CURRENT CIRCUIT JSON", treat the "USER REQUEST" as a modification instruction for THAT circuit. 
- Preserve existing component IDs if they are not being removed or replaced, to ensure smooth transitions in the UI.

STRICT EXAMPLE REPRODUCTION (CRITICAL):
- If the USER REQUEST matches the name or theme of any circuit in the "REFERENCE EXAMPLES" (e.g., "Start Stop", "Star Delta", "Traffic Light", etc.), you MUST return the EXACT JSON structure from that example.
- DO NOT innovate, modify, or add any "extra" logic to these examples. Return them exactly as they are defined in the reference. "No Innovation" (ممنوع التجويد).

LANGUAGE RULE (STRICT):
- You MUST respond in the SAME language as the USER REQUEST.
- If the user sends a message in Arabic, the "explanation" MUST be in Arabic.
- If the user sends a message in English, the "explanation" MUST be in English.

EXPLANATION CONTENT:
- You MUST provide a professional explanation of the circuit.
- The explanation should cover: 
  1. How the current flows through the circuit.
  2. What happens when the user interacts with specific components (e.g., "When you press Start (S1), the contactor K1 energizes and latches...").
  3. The technical purpose of the circuit.
- Put this explanation in a field called "explanation" at the root of your JSON response.

REQUIRED JSON STRUCTURE:
{
  "circuit": { "components": [...], "wires": [...] } or null,
  "explanation": "Your explanation here in the user's language"
}

CONSTRAINTS:
- Return ONLY valid JSON. NO text or explanations outside the JSON.
- DO NOT use flattened wire properties (like fromPort). Use the nested object structure shown above.
`;

        // 1. Strict/Fuzzy Matching
        const lowerPrompt = prompt.toLowerCase();
        const directMatch = allExamples.find(ex => {
            const exName = ex.prompt.replace("أرسل لي دائرة: ", "").toLowerCase();
            return lowerPrompt.includes(exName) || exName.includes(lowerPrompt);
        });

        if (directMatch && !currentCircuit) {
            console.log("Direct match triggered for:", directMatch.prompt);
            return res.status(200).json({
                circuit: directMatch.circuit,
                explanation: "لقد وجدت هذه الدائرة في قاعدة بياناتي الهندسية الموثوقة. تم استرجاعها بالكامل لضمان الدقة بنسبة 100% في توصيلات الـ Power والـ Control كما هي مسجلة عندي."
            });
        }



        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const contextPrompt = currentCircuit 
            ? `CURRENT CIRCUIT JSON: ${JSON.stringify(currentCircuit)}\n\nUSER MODIFICATION REQUEST: ${prompt}`
            : `USER REQUEST: ${prompt}`;

        let result;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                result = await model.generateContent([SYSTEM_PROMPT, contextPrompt]);
                break; 
            } catch (error) {
                attempts++;
                if (error.status === 503 && attempts < maxAttempts) {
                    console.log(`Gemini busy (503), retrying attempt ${attempts}...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                throw error;
            }
        }

        const responseText = result.response.text();

        // Parse and Clean
        let circuitData = safeJSONParse(responseText);

        // Robustness: If AI forgot the 'circuit' wrapper but provided components/wires
        if (circuitData && !circuitData.circuit && (circuitData.components || circuitData.wires)) {
            circuitData = { 
                circuit: { 
                    components: circuitData.components || [], 
                    wires: circuitData.wires || [] 
                },
                explanation: circuitData.explanation || ""
            };
        }

        if (!circuitData) {
            return res.status(500).json({ 
                error: "AI returned invalid JSON",
                raw: responseText 
            });
        }

        // Validate Circuit part if it exists
        if (circuitData.circuit) {
            const validation = validateCircuit(circuitData);
            if (!validation.isValid) {
                return res.status(500).json({ 
                    error: "AI generated an invalid circuit schema",
                    details: validation.error,
                    raw: circuitData 
                });
            }
        }

        // Return validated JSON
        return res.status(200).json(circuitData);

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ 
            error: "Internal Server Error", 
            message: error.message 
        });
    }
};