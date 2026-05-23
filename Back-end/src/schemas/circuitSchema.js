import { AVAILABLE_COMPONENTS } from '../data/components.js';

/**
 * Validates the generated circuit JSON against the expected schema and component rules.
 * @param {Object} circuit 
 * @returns {Object} { isValid: boolean, error: string | null }
 */
export const validateCircuit = (data) => {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: "Response is not a valid object" };
    }

    const circuit = data.circuit;
    if (!circuit || typeof circuit !== 'object') {
        return { isValid: false, error: "Missing 'circuit' object wrapper" };
    }

    if (!Array.isArray(circuit.components)) {
        return { isValid: false, error: "Missing 'components' array inside circuit" };
    }

    if (!Array.isArray(circuit.wires)) {
        return { isValid: false, error: "Missing 'wires' array inside circuit" };
    }

    // Validate Components
    for (const comp of circuit.components) {
        if (!comp.id || !comp.componentId) {
            return { isValid: false, error: `Component missing id or componentId: ${JSON.stringify(comp)}` };
        }

        if (!AVAILABLE_COMPONENTS[comp.componentId]) {
            return { isValid: false, error: `Invalid component type: ${comp.componentId}` };
        }

        if (typeof comp.x !== 'number' || typeof comp.y !== 'number') {
            return { isValid: false, error: `Component ${comp.id} missing valid coordinates (x, y)` };
        }
    }

    // Validate Wires
    const componentIds = new Set(circuit.components.map(c => c.id));

    for (const wire of circuit.wires) {
        if (!wire.from || !wire.to) {
            return { isValid: false, error: "Wire missing 'from' or 'to' properties" };
        }

        const { compId: fromId, portId: fromPort } = wire.from;
        const { compId: toId, portId: toPort } = wire.to;

        if (!fromId || !fromPort || !toId || !toPort) {
            return { isValid: false, error: "Wire endpoints missing compId or portId" };
        }

        if (!componentIds.has(fromId)) {
            return { isValid: false, error: `Wire references unknown component: ${fromId}` };
        }

        if (!componentIds.has(toId)) {
            return { isValid: false, error: `Wire references unknown component: ${toId}` };
        }

        // Validate Ports
        const fromType = circuit.components.find(c => c.id === fromId).componentId;
        const toType = circuit.components.find(c => c.id === toId).componentId;

        if (!AVAILABLE_COMPONENTS[fromType].ports.includes(fromPort)) {
            return { isValid: false, error: `Invalid port '${fromPort}' for component type '${fromType}'` };
        }

        if (!AVAILABLE_COMPONENTS[toType].ports.includes(toPort)) {
            return { isValid: false, error: `Invalid port '${toPort}' for component type '${toType}'` };
        }
    }

    return { isValid: true, error: null };
};
