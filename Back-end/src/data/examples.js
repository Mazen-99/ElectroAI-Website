/**
 * Put your "Golden Examples" here. 
 * Each example should have a prompt and the corresponding perfect JSON.
 */
export const AI_EXAMPLES = [
    {
        prompt: "اعملي دايرة ستار دلتا منظمة (Star Delta Standard Layout)",
        circuit: {
            "components": [
                { "componentId": "PowerLine", "x": 500, "y": 530, "tagIndex": 1, "label": "L1" },
                { "componentId": "PushButtonNC", "x": 500, "y": 700, "tagIndex": 1, "label": "Stop" },
                { "componentId": "PushButtonNO", "x": 500, "y": 900, "tagIndex": 1, "label": "Start" },
                { "componentId": "NOContact", "x": 640, "y": 900, "tagIndex": 1, "label": "Latch", "prefix": "K" },
                { "componentId": "Contactor", "x": 500, "y": 1485, "tagIndex": 1, "label": "Main", "prefix": "K" },
                { "componentId": "Nutral", "x": 500, "y": 1780, "rotation": 180, "tagIndex": 1, "label": "N" }
            ],
            "wires": [
                { "id": "w1", "from": { "compId": "comp_L", "portId": "p1" }, "to": { "compId": "comp_Stop", "portId": "in" } }
                // ... وهكذا لبقية الأسلاك
            ]
        }
    }
];
