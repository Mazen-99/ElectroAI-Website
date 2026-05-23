/**
 * Utilities for cleaning and parsing AI responses
 */

export const cleanAIResponse = (text) => {
    if (!text) return "";

    // Remove markdown code blocks if present
    // Matches ```json { ... } ``` or ``` { ... } ```
    let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1');
    
    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
};

export const safeJSONParse = (text) => {
    try {
        const cleaned = cleanAIResponse(text);
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parsing Error:", error.message);
        console.error("Raw Text was:", text);
        return null;
    }
};
