/**
 * Available components and their ports extracted from the Frontend components.jsx.
 * This ensures the AI knows exactly which componentId and portId to use.
 */

export const AVAILABLE_COMPONENTS = {
    "ThreePhaseLine": {
        "ports": ["L1", "L2", "L3"],
        "displayName": "3P Line"
    },
    "PowerLine": {
        "ports": ["p1"],
        "displayName": "Line"
    },
    "Nutral": {
        "ports": ["n1"],
        "displayName": "Neutral"
    },
    "Lamp": {
        "ports": ["in", "out"],
        "displayName": "Lamp",
        "availableColors": ["red", "green", "blue", "yellow"]
    },
    "Relay": {
        "ports": ["in", "out"],
        "displayName": "Relay",
        "prefix": "R"
    },
    "Contactor": {
        "ports": ["in", "out"],
        "displayName": "Contactor",
        "prefix": "K"
    },
    "NCContact": {
        "ports": ["in", "out"],
        "displayName": "NC Contact",
        "prefix": "R"
    },
    "NOContact": {
        "ports": ["in", "out"],
        "displayName": "NO Contact",
        "prefix": "R"
    },
    "PushButtonNC": {
        "ports": ["in", "out"],
        "displayName": "Push Button NC",
        "prefix": "S"
    },
    "PushButtonNO": {
        "ports": ["in", "out"],
        "displayName": "Push Button NO",
        "prefix": "S"
    },
    "SinglePoleCB": {
        "ports": ["in", "out"],
        "displayName": "1P Circuit Breaker",
        "prefix": "MCB"
    },
    "ThreePoleCB": {
        "ports": ["L1_in", "L2_in", "L3_in", "L1_out", "L2_out", "L3_out"],
        "displayName": "3P Circuit Breaker",
        "prefix": "MCB"
    },
    "ContactorMainContacts": {
        "ports": ["L1_in", "L2_in", "L3_in", "L1_out", "L2_out", "L3_out"],
        "displayName": "Main Contacts",
        "prefix": "K"
    },
    "SimpleMotor": {
        "ports": ["U", "V", "W"],
        "displayName": "Simple Motor",
        "prefix": "M"
    },
    "AdvancedMotor": {
        "ports": ["U1", "V1", "W1", "U2", "V2", "W2"],
        "displayName": "Advanced Motor",
        "prefix": "M"
    },
    "OnDelayTimer": {
        "ports": ["in", "out"],
        "displayName": "On Delay Timer",
        "prefix": "T"
    }
};

export const COMPONENT_TYPES = Object.keys(AVAILABLE_COMPONENTS);
