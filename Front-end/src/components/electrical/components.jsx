/* Electrical Components File */
import React from 'react';

// Helper to determine color based on potential
const getPotColor = (pot, defaultColor, isSimulating) => {
    if (!isSimulating || !pot) return defaultColor;
    if (pot.line) return "#ef4444"; // Red
    if (pot.neutral) return "#2563eb"; // Blue
    return defaultColor; // Use theme-aware default color instead of hardcoded #333
};

// 3 Phase Line
export const ThreePhaseLine = ({ color = "#000", portPotentials = {}, isSimulating = false }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 150 100">
            <g id="_3_Phase_Power" data-name="3 Phase Power" transform="translate(-673 1203)">
                <g id="Ellipse_1" data-name="Ellipse 1" transform="translate(673 -1203)" fill="none" stroke={getPotColor(portPotentials['L1'], color, isSimulating)} stroke-width="1">
                    <circle cx="25" cy="25" r="25" stroke="none" />
                    <circle cx="25" cy="25" r="24.5" fill="none" />
                </g>
                <text id="L1" transform="translate(683 -1166)" font-size="30" font-family="SegoeUI, Segoe UI" fill={getPotColor(portPotentials['L1'], color, isSimulating)}><tspan x="0" y="0">L1</tspan></text>
                <line id="Line_1" data-name="Line 1" y2="50" transform="translate(698 -1153)" fill="none" stroke={getPotColor(portPotentials['L1'], color, isSimulating)} stroke-width="1" />

                <g id="Ellipse_1-2" data-name="Ellipse 1" transform="translate(723 -1203)" fill="none" stroke={getPotColor(portPotentials['L2'], color, isSimulating)} stroke-width="1">
                    <circle cx="25" cy="25" r="25" stroke="none" />
                    <circle cx="25" cy="25" r="24.5" fill="none" />
                </g>
                <text id="L2" transform="translate(733 -1166)" font-size="30" font-family="SegoeUI, Segoe UI" fill={getPotColor(portPotentials['L2'], color, isSimulating)}><tspan x="0" y="0">L2</tspan></text>
                <line id="Line_1-2" data-name="Line 1" y2="50" transform="translate(748 -1153)" fill="none" stroke={getPotColor(portPotentials['L2'], color, isSimulating)} stroke-width="1" />

                <g id="Ellipse_1-3" data-name="Ellipse 1" transform="translate(773 -1203)" fill="none" stroke={getPotColor(portPotentials['L3'], color, isSimulating)} stroke-width="1">
                    <circle cx="25" cy="25" r="25" stroke="none" />
                    <circle cx="25" cy="25" r="24.5" fill="none" />
                </g>
                <text id="L3" transform="translate(783 -1166)" font-size="30" font-family="SegoeUI, Segoe UI" fill={getPotColor(portPotentials['L3'], color, isSimulating)}><tspan x="0" y="0">L3</tspan></text>
                <line id="Line_1-3" data-name="Line 1" y2="50" transform="translate(798 -1153)" fill="none" stroke={getPotColor(portPotentials['L3'], color, isSimulating)} stroke-width="1" />
            </g>
        </svg>
    )
}

// Single Phase Line
export const PowerLine = ({ color = "#000", portPotentials = {}, isSimulating = false }) => {
    const potColor = getPotColor(portPotentials['p1'], color, isSimulating);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="51" height="100" viewBox="0 0 50 100">
            <g id="Single_Phase_Power" data-name="Single Phase Power" transform="translate(-656 1313)">
                <g id="Ellipse_1" data-name="Ellipse 1" transform="translate(656 -1313)" fill="none" stroke={potColor} stroke-width="1">
                    <circle cx="25" cy="25" r="25" stroke="none" />
                    <circle cx="25" cy="25" r="24.5" fill="none" />
                </g>
                <text id="L" transform="translate(674 -1276)" font-size="30" font-family="SegoeUI, Segoe UI" fill={potColor}><tspan x="0" y="0">L</tspan></text>
                <line id="Line_1" data-name="Line 1" y2="50" transform="translate(681 -1263)" fill="none" stroke={potColor} stroke-width="1" />
            </g>
        </svg>
    )
}

// Nutral
export const Nutral = ({ color = "#000", portPotentials = {}, isSimulating = false }) => {
    const potColor = getPotColor(portPotentials['n1'], color, isSimulating);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="100" viewBox="0 0 50 100">
            <g id="Nutral" transform="translate(-656 1313)">
                <g id="Ellipse_1" data-name="Ellipse 1" transform="translate(656 -1313)" fill="none" stroke={potColor} stroke-width="1">
                    <circle cx="25" cy="25" r="25" stroke="none" />
                    <circle cx="25" cy="25" r="24.5" fill="none" />
                </g>
                <text id="N" transform="translate(670 -1276)" font-size="30" font-family="SegoeUI, Segoe UI" fill={potColor}><tspan x="0" y="0">N</tspan></text>
                <line id="Line_1" data-name="Line 1" y2="50" transform="translate(681 -1263)" fill="none" stroke={potColor} stroke-width="1" />
            </g>
        </svg>
    )
}

// Lamp
export const Lamp = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false, bulbColor = 'red' }) => {
    // Colors for different bulb types
    const glowColors = {
        red: { on: "#ef4444", off: "transparent" },
        green: { on: "#22c55e", off: "transparent" },
        blue: { on: "#3b82f6", off: "transparent" },
        yellow: { on: "#fbbf24", off: "transparent" }
    };

    const currentGlow = glowColors[bulbColor] || glowColors.red;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="150" viewBox="0 0 50 150">
            <g id="Lamp" transform="translate(-779 1375)">
                <g id="Nutral" transform="translate(123 -12)">
                    <g id="Ellipse_1" data-name="Ellipse 1" transform="translate(656 -1313)" fill={isOn ? currentGlow.on : currentGlow.off} stroke={color} stroke-width="1">
                        <circle cx="25" cy="25" r="25" stroke="none" />
                        <circle cx="25" cy="25" r="24.5" fill="none" />
                    </g>
                    <line id="Line_1" data-name="Line 1" y2="50" transform="translate(681 -1263)" fill="none" stroke={getPotColor(portPotentials['out'], color, isSimulating)} stroke-width="1" />
                    <line id="Line_2" data-name="Line 2" y2="50" transform="translate(681 -1363)" fill="none" stroke={getPotColor(portPotentials['in'], color, isSimulating)} stroke-width="1" />
                </g>
                <line id="Line_3" data-name="Line 3" x1="30" y2="39" transform="translate(789.5 -1319.5)" fill="none" stroke={color} stroke-width="1" />
                <line id="Line_4" data-name="Line 4" x1="30" y1="40" transform="translate(789.5 -1320.5)" fill="none" stroke={color} stroke-width="1" />
            </g>
        </svg>
    )
}

// Relay
export const Relay = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150">
            <g id="Relay" transform="translate(-918 1360)">
                <g id="Rectangle_1" data-name="Rectangle 1" transform="translate(918 -1310)" fill={isOn ? "#ffea00" : "transparent"} stroke={color} stroke-width="1">
                    <rect width="100" height="50" stroke="none" />
                    <rect x="0.5" y="0.5" width="99" height="49" fill="none" />
                </g>
                <line id="Line_5" data-name="Line 5" y2="50" transform="translate(968 -1360)" fill="none" stroke={getPotColor(portPotentials['in'], color, isSimulating)} stroke-width="1" />
                <line id="Line_6" data-name="Line 6" y2="50" transform="translate(968 -1260)" fill="none" stroke={getPotColor(portPotentials['out'], color, isSimulating)} stroke-width="1" />
                <text id="R" transform="translate(968 -1270)" font-size="40" font-family="SegoeUI, Segoe UI" fill={color} text-anchor="middle"><tspan x="0" y="0">R</tspan></text>
            </g>
        </svg>
    )
}

// Contactor
export const Contactor = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150">
            <g id="Contactor" transform="translate(-918 1360)">
                <g id="Rectangle_1" data-name="Rectangle 1" transform="translate(918 -1310)" fill={isOn ? "#ffea00" : "transparent"} stroke={color} stroke-width="1">
                    <rect width="100" height="50" stroke="none" />
                    <rect x="0.5" y="0.5" width="99" height="49" fill="none" />
                </g>
                <line id="Line_5" data-name="Line 5" y2="50" transform="translate(968 -1360)" fill="none" stroke={getPotColor(portPotentials['in'], color, isSimulating)} stroke-width="1" />
                <line id="Line_6" data-name="Line 6" y2="50" transform="translate(968 -1260)" fill="none" stroke={getPotColor(portPotentials['out'], color, isSimulating)} stroke-width="1" />
                <text id="K" transform="translate(968 -1270)" font-size="40" font-family="SegoeUI, Segoe UI" fill={color} text-anchor="middle"><tspan x="0" y="0">K</tspan></text>
            </g>
        </svg>

    )
}

const NCPaths = ({ color, inColor, outColor }) => (
    <g id="NC_Contact" data-name="NC Contact" transform="translate(-1086.5 1369.5)">
        <line id="Line_7" data-name="Line 7" y2="50" transform="translate(1101.5 -1369.5)" fill="none" stroke={inColor || color} strokeWidth="1" />
        <line id="Line_8" data-name="Line 8" x1="15" transform="translate(1101.5 -1320)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_9" data-name="Line 9" y2="50" transform="translate(1101.5 -1289.5)" fill="none" stroke={outColor || color} strokeWidth="1" />
        <path id="Path_1" data-name="Path 1" d="M15,0,0,34" transform="translate(1101.5 -1323)" fill="none" stroke={color} strokeWidth="1" />
    </g>
);

const NOPaths = ({ color, inColor, outColor }) => (
    <g id="NO_Contact" data-name="NO Contact" transform="translate(-1086.5 1369.5)">
        <line id="Line_7" data-name="Line 7" y2="50" transform="translate(1101.5 -1369.5)" fill="none" stroke={inColor || color} strokeWidth="1" />
        <line id="Line_9" data-name="Line 9" y2="50" transform="translate(1101.5 -1289.5)" fill="none" stroke={outColor || color} strokeWidth="1" />
        <path id="Path_1" data-name="Path 1" d="M15,0,0,34" transform="translate(1101.5 -1323)" fill="none" stroke={color} strokeWidth="1" />
    </g>
);

const PBNCPaths = ({ color, inColor, outColor }) => (
    <g id="Push_Button_NC" transform="translate(-1111.5 1363)">
        <line id="Line_12" x1="8.5" transform="translate(1111.5 -1309)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_13" x1="8.5" transform="translate(1111.5 -1290)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_14" y1="19" transform="translate(1112 -1309)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_7" y2="50" transform="translate(1128.5 -1363)" fill="none" stroke={inColor || color} strokeWidth="1" />
        <line id="Line_8" x1="15" transform="translate(1128.5 -1313.5)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_9" y2="50" transform="translate(1128.5 -1283)" fill="none" stroke={outColor || color} strokeWidth="1" />
        <path id="Path_1" d="M15,0,0,34" transform="translate(1128.5 -1316.5)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_15" x1="23" transform="translate(1113.5 -1299.5)" fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 1.5" />
    </g>
);

const PBNOPaths = ({ color, inColor, outColor }) => (
    <g id="Push_Button_NO" transform="translate(-1111.5 1363)">
        <line id="Line_12" x1="8.5" transform="translate(1111.5 -1309)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_13" x1="8.5" transform="translate(1111.5 -1290)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_14" y1="19" transform="translate(1112 -1309)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_7" y2="50" transform="translate(1128.5 -1363)" fill="none" stroke={inColor || color} strokeWidth="1" />
        <line id="Line_9" y2="50" transform="translate(1128.5 -1283)" fill="none" stroke={outColor || color} strokeWidth="1" />
        <path id="Path_1" d="M15,0,0,34" transform="translate(1128.5 -1316.5)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_15" x1="23" transform="translate(1113.5 -1299.5)" fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 1.5" />
    </g>
);

// NC Contact
export const NCContact = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false, prefix = "R" }) => {
    // NC is conducting when NOT energized (isOn is false)
    const isConducting = !isOn;
    const hasPower = portPotentials['in']?.line || portPotentials['out']?.line;
    const isLive = isSimulating && isConducting && hasPower;
    const activeColor = isLive ? "#ef4444" : color;

    const inColor = getPotColor(portPotentials['in'], color, isSimulating);
    const outColor = getPotColor(portPotentials['out'], color, isSimulating);

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={prefix === 'T' ? "33.958" : "30"} height="130" viewBox={prefix === 'T' ? "0 0 33.958 130" : "0 0 30 130"}>
            {prefix === 'T' ? (
                isOn ?
                    <NOTimerPaths color={color} inColor={inColor} outColor={outColor} /> :
                    <NCTimerPaths color={activeColor} inColor={inColor} outColor={outColor} />
            ) : (
                isOn ?
                    <NOPaths color={color} inColor={inColor} outColor={outColor} /> :
                    <NCPaths color={activeColor} inColor={inColor} outColor={outColor} />
            )}
        </svg>
    )
}

// NO Contact
export const NOContact = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false, prefix = "R" }) => {
    // NO is conducting when energized (isOn is true)
    const isConducting = isOn;
    const activeColor = (isSimulating && isConducting) ? "#ef4444" : color;
    const inColor = getPotColor(portPotentials['in'], color, isSimulating);
    const outColor = getPotColor(portPotentials['out'], color, isSimulating);

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={prefix === 'T' ? "33.957" : "30"} height="130" viewBox={prefix === 'T' ? "0 0 33.957 130" : "0 0 30 130"}>
            {prefix === 'T' ? (
                isOn ?
                    <NCTimerPaths color={activeColor} inColor={inColor} outColor={outColor} /> :
                    <NOTimerPaths color={color} inColor={inColor} outColor={outColor} />
            ) : (
                isOn ?
                    <NCPaths color={activeColor} inColor={inColor} outColor={outColor} /> :
                    <NOPaths color={color} inColor={inColor} outColor={outColor} />
            )}
        </svg>
    )
}

// Push Button NC
export const PushButtonNC = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false }) => {
    // For PB NC, isOn means 'Pressed/Open'. 
    // Conducting state is when NOT pressed.
    const isConducting = !isOn;
    const hasPower = portPotentials['in']?.line || portPotentials['out']?.line;
    const isLive = isSimulating && isConducting && hasPower;
    const activeColor = isLive ? "#ef4444" : color;

    const inColor = getPotColor(portPotentials['in'], color, isSimulating);
    const outColor = getPotColor(portPotentials['out'], color, isSimulating);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="130" viewBox="0 0 34 130">
            {isOn ?
                <PBNOPaths color={color} inColor={inColor} outColor={outColor} /> :
                <PBNCPaths color={activeColor} inColor={inColor} outColor={outColor} />
            }
        </svg>
    )
}

// Push Button NO
export const PushButtonNO = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false }) => {
    // For PB NO, isOn means 'Pressed/Closed'.
    // Conducting state is when pressed.
    const isConducting = isOn;
    const activeColor = (isSimulating && isConducting) ? "#ef4444" : color;
    const inColor = getPotColor(portPotentials['in'], color, isSimulating);
    const outColor = getPotColor(portPotentials['out'], color, isSimulating);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="130" viewBox="0 0 34 130">
            {isOn ?
                <PBNCPaths color={activeColor} inColor={inColor} outColor={outColor} /> :
                <PBNOPaths color={color} inColor={inColor} outColor={outColor} />
            }
        </svg>
    )
}

// Main Contact For Contactor NO
export const MainContactNO = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="69.954" height="130" viewBox="0 0 69.954 130">
            <g id="Main_Contact_For_Contactor" data-name="Main Contact For Contactor" transform="translate(-1171 1573)">
                <g id="Contact_1" data-name="Contact 1" transform="translate(1 -1)">
                    <line id="Line_7" data-name="Line 7" y2="50" transform="translate(1170.51 -1572)" fill="none" stroke={color} stroke-width="1" />
                    <path id="Path_2" data-name="Path 2" d="M-.01-.758,0,50" transform="translate(1170.51 -1492)" fill="none" stroke={color} stroke-width="1" />
                    <line id="Line_16" data-name="Line 16" x1="15" y2="29" transform="translate(1170.51 -1521.5)" fill="none" stroke={color} stroke-width="1" />
                    <g id="Rectangle_2" data-name="Rectangle 2" transform="translate(1170 -1529)" fill="transparent" stroke={color} stroke-width="1">
                        <path d="M0,0H.5A3.5,3.5,0,0,1,4,3.5v0A3.5,3.5,0,0,1,.5,7H0A0,0,0,0,1,0,7V0A0,0,0,0,1,0,0Z" stroke="none" />
                        <path d="M.5.5h0a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3h0a0,0,0,0,1,0,0V.5A0,0,0,0,1,.5.5Z" fill="none" />
                    </g>
                </g>
                <g id="Contact_2" data-name="Contact 2" transform="translate(28 -1)">
                    <line id="Line_7-2" data-name="Line 7" y2="50" transform="translate(1170.51 -1572)" fill="none" stroke={color} stroke-width="1" />
                    <path id="Path_2-2" data-name="Path 2" d="M-.01-.758,0,50" transform="translate(1170.51 -1492)" fill="none" stroke={color} stroke-width="1" />
                    <line id="Line_16-2" data-name="Line 16" x1="15" y2="29" transform="translate(1170.51 -1521.5)" fill="none" stroke={color} stroke-width="1" />
                    <g id="Rectangle_2-2" data-name="Rectangle 2" transform="translate(1170 -1529)" fill="transparent" stroke={color} stroke-width="1">
                        <path d="M0,0H.5A3.5,3.5,0,0,1,4,3.5v0A3.5,3.5,0,0,1,.5,7H0A0,0,0,0,1,0,7V0A0,0,0,0,1,0,0Z" stroke="none" />
                        <path d="M.5.5h0a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3h0a0,0,0,0,1,0,0V.5A0,0,0,0,1,.5.5Z" fill="none" />
                    </g>
                </g>
                <g id="Contact_3" data-name="Contact 3" transform="translate(55 -1)">
                    <line id="Line_7-3" data-name="Line 7" y2="50" transform="translate(1170.51 -1572)" fill="none" stroke={color} stroke-width="1" />
                    <path id="Path_2-3" data-name="Path 2" d="M-.01-.758,0,50" transform="translate(1170.51 -1492)" fill="none" stroke={color} stroke-width="1" />
                    <line id="Line_16-3" data-name="Line 16" x1="15" y2="29" transform="translate(1170.51 -1521.5)" fill="none" stroke={color} stroke-width="1" />
                    <g id="Rectangle_2-3" data-name="Rectangle 2" transform="translate(1170 -1529)" fill="transparent" stroke={color} stroke-width="1">
                        <path d="M0,0H.5A3.5,3.5,0,0,1,4,3.5v0A3.5,3.5,0,0,1,.5,7H0A0,0,0,0,1,0,7V0A0,0,0,0,1,0,0Z" stroke="none" />
                        <path d="M.5.5h0a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3h0a0,0,0,0,1,0,0V.5A0,0,0,0,1,.5.5Z" fill="none" />
                    </g>
                </g>
            </g>
        </svg>

    )
}

// Main Contact For Contactor NC (Using when NO is closed by the coil)
export const MainContactNC = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36.997" height="130" viewBox="0 0 36.997 130">
            <g id="Main_Contact_For_Contactor_NC" data-name="Main Contact For Contactor NC" transform="translate(-1171 1573)">
                <g id="Contact_1" data-name="Contact 1" transform="translate(1 -1)">
                    <line id="Line_7" data-name="Line 7" y2="50" transform="translate(1170.51 -1572)" fill="none" stroke={color} stroke-width="1" />
                    <path id="Path_2" data-name="Path 2" d="M-.01-.758,0,50" transform="translate(1170.51 -1492)" fill="none" stroke={color} stroke-width="1" />
                    <line id="Line_16" data-name="Line 16" x1="3.99" y2="34" transform="translate(1170.51 -1526.5)" fill="none" stroke={color} stroke-width="1" />
                    <g id="Rectangle_2" data-name="Rectangle 2" transform="translate(1170 -1529)" fill="transparent" stroke={color} stroke-width="1">
                        <path d="M0,0H.5A3.5,3.5,0,0,1,4,3.5v0A3.5,3.5,0,0,1,.5,7H0A0,0,0,0,1,0,7V0A0,0,0,0,1,0,0Z" stroke="none" />
                        <path d="M.5.5h0a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3h0a0,0,0,0,1,0,0V.5A0,0,0,0,1,.5.5Z" fill="none" />
                    </g>
                </g>
                <g id="Contact_2" data-name="Contact 2" transform="translate(17 -1)">
                    <line id="Line_7-2" data-name="Line 7" y2="50" transform="translate(1170.51 -1572)" fill="none" stroke={color} stroke-width="1" />
                    <path id="Path_2-2" data-name="Path 2" d="M-.01-.758,0,50" transform="translate(1170.51 -1492)" fill="none" stroke={color} stroke-width="1" />
                    <line id="Line_16-2" data-name="Line 16" x1="3.99" y2="34" transform="translate(1170.51 -1526.5)" fill="none" stroke={color} stroke-width="1" />
                    <g id="Rectangle_2-2" data-name="Rectangle 2" transform="translate(1170 -1529)" fill="transparent" stroke={color} stroke-width="1">
                        <path d="M0,0H.5A3.5,3.5,0,0,1,4,3.5v0A3.5,3.5,0,0,1,.5,7H0A0,0,0,0,1,0,7V0A0,0,0,0,1,0,0Z" stroke="none" />
                        <path d="M.5.5h0a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3h0a0,0,0,0,1,0,0V.5A0,0,0,0,1,.5.5Z" fill="none" />
                    </g>
                </g>
                <g id="Contact_3" data-name="Contact 3" transform="translate(33 -1)">
                    <line id="Line_7-3" data-name="Line 7" y2="50" transform="translate(1170.51 -1572)" fill="none" stroke={color} stroke-width="1" />
                    <path id="Path_2-3" data-name="Path 2" d="M-.01-.758,0,50" transform="translate(1170.51 -1492)" fill="none" stroke={color} stroke-width="1" />
                    <line id="Line_16-3" data-name="Line 16" x1="3.99" y2="34" transform="translate(1170.51 -1526.5)" fill="none" stroke={color} stroke-width="1" />
                    <g id="Rectangle_2-3" data-name="Rectangle 2" transform="translate(1170 -1529)" fill="transparent" stroke={color} stroke-width="1">
                        <path d="M0,0H.5A3.5,3.5,0,0,1,4,3.5v0A3.5,3.5,0,0,1,.5,7H0A0,0,0,0,1,0,7V0A0,0,0,0,1,0,0Z" stroke="none" />
                        <path d="M.5.5h0a3,3,0,0,1,3,3v0a3,3,0,0,1-3,3h0a0,0,0,0,1,0,0V.5A0,0,0,0,1,.5.5Z" fill="none" />
                    </g>
                </g>
            </g>
        </svg>
    )
}

const CBSingleBoleNOPaths = ({ color, inColor, outColor }) => (
    <g id="Circut_Bracker_1_Bole" transform="translate(-1169 1724)">
        <line id="Line_7" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
        <path id="Path_2" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
        <line id="Line_16" x1="15" y2="29" transform="translate(1171 -1674.5)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_17" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_18" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={color} strokeWidth="1" />
    </g>
);

const CBSingleBoleNCPaths = ({ color, inColor, outColor }) => (
    <g id="First_bole" transform="translate(-1169 1724)">
        <line id="Line_7" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
        <path id="Path_2" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
        <line id="Line_16" x1="2.49" y2="31" transform="translate(1171 -1676.5)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_17" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={color} strokeWidth="1" />
        <line id="Line_18" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={color} strokeWidth="1" />
    </g>
);

// Single Pole Circuit Breaker
export const SinglePoleCB = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false }) => {
    // For CB, isOn means 'Closed/Conducting'.
    const hasPower = portPotentials['in']?.line || portPotentials['out']?.line;
    const isLive = isSimulating && isOn && hasPower;
    const activeColor = isLive ? "#ef4444" : color;

    const inColor = getPotColor(portPotentials['in'], color, isSimulating);
    const outColor = getPotColor(portPotentials['out'], color, isSimulating);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="129" viewBox="0 0 22 129">
            {isOn ?
                <CBSingleBoleNCPaths color={activeColor} inColor={inColor} outColor={outColor} /> :
                <CBSingleBoleNOPaths color={color} inColor={inColor} outColor={outColor} />
            }
        </svg>
    )
}

const CBThreeBoleNOPaths = ({ color, l1Color, l2Color, l3Color, inColor, outColor }) => (
    <g id="Circut_Breaker_3_Bole" transform="translate(-1171 1879)">
        <g id="First_bole" transform="translate(-50 -155)">
            <line id="Line_7" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
            <path id="Path_2" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
            <line id="Line_16" x1="15" y2="29" transform="translate(1171 -1674.5)" fill="none" stroke={l1Color || color} strokeWidth="1" />
            <line id="Line_17" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l1Color || color} strokeWidth="1" />
            <line id="Line_18" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l1Color || color} strokeWidth="1" />
        </g>
        <g id="Second_bole" transform="translate(0 -155)">
            <line id="Line_7-2" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
            <path id="Path_2-2" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
            <line id="Line_16-2" x1="15" y2="29" transform="translate(1171 -1674.5)" fill="none" stroke={l2Color || color} strokeWidth="1" />
            <line id="Line_17-2" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l2Color || color} strokeWidth="1" />
            <line id="Line_18-2" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l2Color || color} strokeWidth="1" />
        </g>
        <g id="Thired_bole" transform="translate(50 -155)">
            <line id="Line_7-3" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
            <path id="Path_2-3" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
            <line id="Line_16-3" x1="15" y2="29" transform="translate(1171 -1674.5)" fill="none" stroke={l3Color || color} strokeWidth="1" />
            <line id="Line_17-3" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l3Color || color} strokeWidth="1" />
            <line id="Line_18-3" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l3Color || color} strokeWidth="1" />
        </g>
        {/* Mechanical Linkage Line - Corrected for horizontal 180 degree alignment */}
        <line x1="1121" y1="-1815" x2="1221" y2="-1815" stroke={color} strokeWidth="1" strokeDasharray="5,3" />
    </g>
);

const CBThreeBoleNCPaths = ({ color, l1Color, l2Color, l3Color, inColor, outColor }) => (
    <g id="Circut_Breaker_3_Bole_NC" transform="translate(-1171 1879)">
        <g id="First_bole" transform="translate(-50 -155)">
            <line id="Line_7" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
            <path id="Path_2" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
            <line id="Line_16" x1="2.49" y2="31" transform="translate(1171 -1676.5)" fill="none" stroke={l1Color || color} strokeWidth="1" />
            <line id="Line_17" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l1Color || color} strokeWidth="1" />
            <line id="Line_18" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l1Color || color} strokeWidth="1" />
        </g>
        <g id="Second_bole" transform="translate(0 -155)">
            <line id="Line_7-2" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
            <path id="Path_2-2" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
            <line id="Line_16-2" x1="2.49" y2="31" transform="translate(1171 -1676.5)" fill="none" stroke={l2Color || color} strokeWidth="1" />
            <line id="Line_17-2" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l2Color || color} strokeWidth="1" />
            <line id="Line_18-2" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l2Color || color} strokeWidth="1" />
        </g>
        <g id="Thired_bole" transform="translate(50 -155)">
            <line id="Line_7-3" y1="50" transform="translate(1171 -1724)" fill="none" stroke={inColor || color} strokeWidth="1" />
            <path id="Path_2-3" d="M0,0,0,50" transform="translate(1171 -1645)" fill="none" stroke={outColor || color} strokeWidth="1" />
            <line id="Line_16-3" x1="2.49" y2="31" transform="translate(1171 -1676.5)" fill="none" stroke={l3Color || color} strokeWidth="1" />
            <line id="Line_17-3" x1="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l3Color || color} strokeWidth="1" />
            <line id="Line_18-3" x2="3" y2="4" transform="translate(1169.5 -1676.5)" fill="none" stroke={l3Color || color} strokeWidth="1" />
        </g>
        {/* Mechanical Linkage Line - Corrected for horizontal 180 degree alignment */}
        <line x1="1121" y1="-1815" x2="1221" y2="-1815" stroke={color} strokeWidth="1" strokeDasharray="5,3" />
    </g>
);

// Three Pole Circuit Breaker
export const ThreePoleCB = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false }) => {
    // For CB, isOn means 'Closed/Conducting'.
    // Check if ANY of the 6 ports has line potential
    const hasPower = Object.values(portPotentials).some(p => p?.line);
    const isConducting = isOn && hasPower;

    // If it's simulating and REALLY conducting, the WHOLE component turns red
    const activeColor = (isSimulating && isConducting) ? "#ef4444" : color;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="125" height="129" viewBox="0 0 125 129">
            <g id="ThreePoleCB_Container" transform="translate(62.5 0)">
                {isOn ?
                    <CBThreeBoleNCPaths
                        color={activeColor}
                        l1Color={activeColor} l2Color={activeColor} l3Color={activeColor}
                        inColor={activeColor} outColor={activeColor}
                    /> :
                    <CBThreeBoleNOPaths
                        color={color}
                        l1Color={color} l2Color={color} l3Color={color}
                        inColor={color} outColor={color}
                    />
                }
            </g>
        </svg>
    )
}

// Contactor Main Contacts (3-Pole)
export const ContactorMainContacts = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false }) => {
    // For Contactor Main Contacts, 'isOn' means the Coil is energized (Contacts are CLOSED)
    const getPoleColor = (p) => {
        const inPot = portPotentials[p + '_in'];
        const outPot = portPotentials[p + '_out'];
        const isConducting = isOn && (inPot?.line || outPot?.line);
        return (isSimulating && isConducting) ? "#ef4444" : color;
    };

    const l1Color = getPoleColor('L1');
    const l2Color = getPoleColor('L2');
    const l3Color = getPoleColor('L3');

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="125" height="129" viewBox="0 0 125 129">
            <g id="MainContacts_Container" transform="translate(62.5 0)">
                {isOn ? (
                    <g id="NC_State" transform="translate(-1171 1879)">
                        {/* Pole 1 NC */}
                        <g transform="translate(-50 -155)">
                            <line y1="50" transform="translate(1171 -1724)" fill="none" stroke={l1Color} strokeWidth="1" />
                            <line y1="50" transform="translate(1171 -1645)" fill="none" stroke={l1Color} strokeWidth="1" />
                            <line x1="2.5" y2="31" transform="translate(1171 -1676.5)" fill="none" stroke={l1Color} strokeWidth="1" />
                        </g>
                        {/* Pole 2 NC */}
                        <g transform="translate(0 -155)">
                            <line y1="50" transform="translate(1171 -1724)" fill="none" stroke={l2Color} strokeWidth="1" />
                            <line y1="50" transform="translate(1171 -1645)" fill="none" stroke={l2Color} strokeWidth="1" />
                            <line x1="2.5" y2="31" transform="translate(1171 -1676.5)" fill="none" stroke={l2Color} strokeWidth="1" />
                        </g>
                        {/* Pole 3 NC */}
                        <g transform="translate(50 -155)">
                            <line y1="50" transform="translate(1171 -1724)" fill="none" stroke={l3Color} strokeWidth="1" />
                            <line y1="50" transform="translate(1171 -1645)" fill="none" stroke={l3Color} strokeWidth="1" />
                            <line x1="2.5" y2="31" transform="translate(1171 -1676.5)" fill="none" stroke={l3Color} strokeWidth="1" />
                        </g>
                        <line x1="1120" y1="-1815" x2="1225" y2="-1815" stroke={color} strokeWidth="1" strokeDasharray="5,3" />
                    </g>
                ) : (
                    <g id="NO_State" transform="translate(-1171 1879)">
                        {/* Pole 1 NO */}
                        <g transform="translate(-50 -155)">
                            <line y1="50" transform="translate(1171 -1724)" fill="none" stroke={color} strokeWidth="1" />
                            <line y1="50" transform="translate(1171 -1645)" fill="none" stroke={color} strokeWidth="1" />
                            <line x1="15" y2="29" transform="translate(1171 -1674.5)" fill="none" stroke={color} strokeWidth="1" />
                        </g>
                        {/* Pole 2 NO */}
                        <g transform="translate(0 -155)">
                            <line y1="50" transform="translate(1171 -1724)" fill="none" stroke={color} strokeWidth="1" />
                            <line y1="50" transform="translate(1171 -1645)" fill="none" stroke={color} strokeWidth="1" />
                            <line x1="15" y2="29" transform="translate(1171 -1674.5)" fill="none" stroke={color} strokeWidth="1" />
                        </g>
                        {/* Pole 3 NO */}
                        <g transform="translate(50 -155)">
                            <line y1="50" transform="translate(1171 -1724)" fill="none" stroke={color} strokeWidth="1" />
                            <line y1="50" transform="translate(1171 -1645)" fill="none" stroke={color} strokeWidth="1" />
                            <line x1="15" y2="29" transform="translate(1171 -1674.5)" fill="none" stroke={color} strokeWidth="1" />
                        </g>
                        <line x1="1120" y1="-1815" x2="1225" y2="-1815" stroke={color} strokeWidth="1" strokeDasharray="5,3" />
                    </g>
                )}
            </g>
        </svg>
    );
}

/// Simple Motor
export const SimpleMotor = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false, isSelected = false, motorState = {} }) => {
    const { direction } = motorState || {};
    const activeColor = (isSimulating && isOn) ? "#ffea00" : "transparent";
    const strokeColor = (isSimulating && isOn) ? "#d97706" : color;
    const selectionGlow = isSelected ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))" : "none";
    const modeColor = "#d97706";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="220" viewBox="0 0 200 220" style={{ filter: selectionGlow }}>
            {/* Port Labels - Bold and Centered above terminals */}
            <g fill={color} opacity="0.7" fontSize="14" fontWeight="black" fontFamily="Arial">
                <text x="35" y="15" textAnchor="middle">U</text>
                <text x="85" y="15" textAnchor="middle">V</text>
                <text x="135" y="15" textAnchor="middle">W</text>
            </g>

            {/* Motor Housing (Centered at 100, 110) */}
            <g transform="translate(40 50)">
                <circle cx="60" cy="60" r="60" fill={activeColor} stroke={strokeColor} strokeWidth="1" />
                <text x="60" y="85" fill={strokeColor} fontSize="60" fontWeight="bold" fontFamily="SegoeUI, Segoe UI" textAnchor="middle">M</text>
            </g>

            {/* Top Terminals (x: 50, 100, 150 | y: 0) - Aligned with Grid */}
            <line x1="50" y1="0" x2="50" y2="76" stroke={strokeColor} strokeWidth="1" />
            <line x1="100" y1="0" x2="100" y2="50" stroke={strokeColor} strokeWidth="1" />
            <line x1="150" y1="0" x2="150" y2="76" stroke={strokeColor} strokeWidth="1" />

            {isSimulating && isOn && (
                <g transform="translate(100, 110)">
                    {/* Mode Indicator (Y) */}
                    <text x="80" y="-5" textAnchor="middle" fontSize="32" fontWeight="black" fill="none" stroke={modeColor} strokeWidth="1">
                        Y
                    </text>

                    {/* Direction Simple Arrow - Moved below Mode Indicator */}
                    <g transform="translate(80, 25)">
                        <g stroke={modeColor} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none">
                            {direction === 'reverse' ? (
                                <path d="M15,0 L-15,0 M-5,-8 L-15,0 L-5,8" /> // Left Arrow
                            ) : (
                                <path d="M-15,0 L15,0 M5,-8 L15,0 L5,8" /> // Right Arrow
                            )}
                        </g>
                    </g>
                </g>
            )}
        </svg>
    )
}

// Advanced Motor
export const AdvancedMotor = ({ color = "#000", isOn = false, isSimulating = false, isSelected = false, motorState = {} }) => {
    const { isRunning, mode, direction } = motorState || {};
    const activeColor = (isSimulating && isRunning) ? "#ffea00" : "transparent";
    const strokeColor = (isSimulating && isRunning) ? "#d97706" : color;
    const selectionGlow = isSelected ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))" : "none";
    const modeColor = "#d97706";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260" style={{ filter: selectionGlow }}>
            {/* Port Labels - Positioned directly above/below terminals */}
            <g fill={color} opacity="0.7" fontSize="13" fontWeight="black" fontFamily="Arial">
                <text x="35" y="15" textAnchor="middle">U1</text>
                <text x="85" y="15" textAnchor="middle">V1</text>
                <text x="135" y="15" textAnchor="middle">W1</text>
                <text x="35" y="260" textAnchor="middle">U2</text>
                <text x="85" y="260" textAnchor="middle">V2</text>
                <text x="135" y="260" textAnchor="middle">W2</text>
            </g>

            {/* Motor Housing (Centered at 100, 130) */}
            <g transform="translate(40 70)">
                <circle cx="60" cy="60" r="60" fill={activeColor} stroke={strokeColor} strokeWidth="1" />
                <text x="60" y="85" fill={strokeColor} fontSize="60" fontWeight="bold" fontFamily="SegoeUI, Segoe UI" textAnchor="middle">M</text>
            </g>

            {/* Top Terminals (x: 50, 100, 150 | y: 0) */}
            <line x1="50" y1="0" x2="50" y2="97" stroke={strokeColor} strokeWidth="1" />
            <line x1="100" y1="0" x2="100" y2="70" stroke={strokeColor} strokeWidth="1" />
            <line x1="150" y1="0" x2="150" y2="97" stroke={strokeColor} strokeWidth="1" />

            {/* Bottom Terminals (x: 50, 100, 150 | y: 260) */}
            <line x1="50" y1="260" x2="50" y2="163" stroke={strokeColor} strokeWidth="1" />
            <line x1="100" y1="260" x2="100" y2="190" stroke={strokeColor} strokeWidth="1" />
            <line x1="150" y1="260" x2="150" y2="163" stroke={strokeColor} strokeWidth="1" />

            {isSimulating && isRunning && (
                <g transform="translate(100, 130)">
                    {/* Mode Indicator (Y / Δ) */}
                    <text x="80" y="-5" textAnchor="middle" fontSize="36" fontWeight="black" fill="none" stroke={modeColor} strokeWidth="1">
                        {mode === 'star' ? 'Y' : 'Δ'}
                    </text>

                    {/* Direction Simple Arrow - Moved below Mode Indicator */}
                    <g transform="translate(80, 25)">
                        <g stroke={modeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
                            {direction === 'reverse' ? (
                                <path d="M15,0 L-15,0 M-5,-8 L-15,0 L-5,8" /> // Left Arrow
                            ) : (
                                <path d="M-15,0 L15,0 M5,-8 L15,0 L5,8" /> // Right Arrow
                            )}
                        </g>
                    </g>
                </g>
            )}
        </svg>
    )
}

// Timer
export const OnDelayTimer = ({ color = "#000", isOn = false, portPotentials = {}, isSimulating = false, timerState = {} }) => {
    const { delay = 1, remainingTime = 1, isEnergized = false } = timerState;

    // When energized and counting down, letters are red.
    const textColor = (isSimulating && isEnergized && !isOn) ? "#ef4444" : color;
    const displayValue = isSimulating && isEnergized ? Math.ceil(remainingTime) : delay;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150">
            <g id="Timer" transform="translate(-1046 942)">
                <g id="Rectangle_1" data-name="Rectangle 1" transform="translate(1046 -892)" fill={isOn ? "#ffea00" : "transparent"} stroke={color} stroke-width="1">
                    <rect width="100" height="50" stroke="none" />
                    <rect x="0.5" y="0.5" width="99" height="49" fill="none" />
                </g>
                <line id="Line_5" data-name="Line 5" y2="50" transform="translate(1096 -942)" fill="none" stroke={getPotColor(portPotentials['in'], color, isSimulating)} stroke-width="1" />
                <line id="Line_6" data-name="Line 6" y2="50" transform="translate(1096 -842)" fill="none" stroke={getPotColor(portPotentials['out'], color, isSimulating)} stroke-width="1" />

                {/* Diagonal lines indicating timer */}
                <line id="Line_26" data-name="Line 26" x1="34" y2="49" transform="translate(1046.5 -891.5)" fill="none" stroke={textColor} stroke-width="1" />
                <line id="Line_27" data-name="Line 27" x2="34" y2="49" transform="translate(1046.5 -891.5)" fill="none" stroke={textColor} stroke-width="1" />
                <line id="Line_28" data-name="Line 28" y2="49" transform="translate(1080.5 -891.5)" fill="none" stroke={textColor} stroke-width="1" />

                <text id="_1" data-name="1" transform="translate(1096 -851)" font-size="40" font-family="SegoeUI, Segoe UI" fill={textColor} text-anchor="middle">
                    <tspan x="20" y="0">{displayValue}</tspan>
                </text>
            </g>
        </svg>
    )
}

// NC Contact Timer
const NCTimerPaths = ({ color, inColor, outColor }) => (
    <g id="NC_Contact_Timer" data-name="NC Contact Timer" transform="translate(-1027 1202)">
        <line id="Line_7" data-name="Line 7" y2="50" transform="translate(1043.979 -1202)" fill="none" stroke={inColor || color} stroke-width="1" />
        <line id="Line_8" data-name="Line 8" x1="15" transform="translate(1043.979 -1152.5)" fill="none" stroke={color} stroke-width="1" />
        <line id="Line_9" data-name="Line 9" y2="50" transform="translate(1043.979 -1122)" fill="none" stroke={outColor || color} stroke-width="1" />
        <path id="Path_1" data-name="Path 1" d="M15,0,0,34" transform="translate(1043.979 -1155.5)" fill="none" stroke={color} stroke-width="1" />
        <line id="Line_29" data-name="Line 29" x1="25" transform="translate(1029.979 -1145.5)" fill="none" stroke={color} stroke-width="1" />
        <line id="Line_30" data-name="Line 30" x1="20" transform="translate(1029.979 -1135.5)" fill="none" stroke={color} stroke-width="1" />
        <text id="_" data-name=")" transform="matrix(-1, 0, 0, 1, 1034.479, -1132)" font-size="30" font-family="SegoeUI-Light, Segoe UI" font-weight="300" fill={color}><tspan x="0" y="0">)</tspan></text>
    </g>
);

// NO Contact Timer
const NOTimerPaths = ({ color, inColor, outColor }) => (
    <g id="NO_Contact_Timer" data-name="NO Contact Timer" transform="translate(-1027 1202)">
        <line id="Line_7" data-name="Line 7" y2="50" transform="translate(1043.979 -1202)" fill="none" stroke={inColor || color} stroke-width="1" />
        <line id="Line_9" data-name="Line 9" y2="50" transform="translate(1043.979 -1122)" fill="none" stroke={outColor || color} stroke-width="1" />
        <path id="Path_1" data-name="Path 1" d="M15,0,0,34" transform="translate(1043.979 -1155.5)" fill="none" stroke={color} stroke-width="1" />
        <line id="Line_29" data-name="Line 29" x1="25" transform="translate(1029.979 -1145.5)" fill="none" stroke={color} stroke-width="1" />
        <line id="Line_30" data-name="Line 30" x1="20.255" transform="translate(1029.979 -1135.5)" fill="none" stroke={color} stroke-width="1" />
        <text id="_" data-name=")" transform="matrix(-1, 0, 0, 1, 1034.479, -1132)" font-size="30" font-family="SegoeUI-Light, Segoe UI" font-weight="300" fill={color}><tspan x="0" y="0">)</tspan></text>
    </g>
);

export const NC_Contact_Timer = ({ color = "#000", inColor, outColor }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="33.958" height="130" viewBox="0 0 33.958 130">
        <NCTimerPaths color={color} inColor={inColor} outColor={outColor} />
    </svg>
);

export const NO_Contact_Timer = ({ color = "#000", inColor, outColor }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="33.957" height="130" viewBox="0 0 33.957 130">
        <NOTimerPaths color={color} inColor={inColor} outColor={outColor} />
    </svg>
);


// Component Map
export const componentMap = {
    ThreePhaseLine: {
        Component: ThreePhaseLine,
        displayName: "3P Line",
        ports: [
            { id: 'L1', x: -50, y: 50, type: 'universal' },
            { id: 'L2', x: 0, y: 50, type: 'universal' },
            { id: 'L3', x: 50, y: 50, type: 'universal' }
        ]
    },
    PowerLine: {
        Component: PowerLine,
        displayName: "Line",
        ports: [
            { id: 'p1', x: 0, y: 50, type: 'universal' }
        ]
    },
    Nutral: {
        Component: Nutral,
        displayName: "Neutral",
        ports: [
            { id: 'n1', x: 0, y: 50, type: 'universal' }
        ]
    },
    Lamp: {
        Component: Lamp,
        displayName: "Lamp",
        showProperties: true,
        labelOffset: { x: -60, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -75, type: 'universal' },
            { id: 'out', x: 0, y: 75, type: 'universal' }
        ]
    },
    Relay: {
        Component: Relay,
        displayName: "Relay",
        prefix: "R",
        showProperties: true,
        labelOffset: { x: -100, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -75, type: 'universal' },
            { id: 'out', x: 0, y: 75, type: 'universal' }
        ]
    },
    Contactor: {
        Component: Contactor,
        displayName: "Contactor",
        prefix: "K",
        showProperties: true,
        labelOffset: { x: -100, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -75, type: 'universal' },
            { id: 'out', x: 0, y: 75, type: 'universal' }
        ]
    },
    NCContact: {
        Component: NCContact,
        displayName: "NC Contact",
        prefix: "R",
        showProperties: true,
        labelOffset: { x: -50, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -65, type: 'universal' },
            { id: 'out', x: 0, y: 65, type: 'universal' }
        ]
    },
    NOContact: {
        Component: NOContact,
        displayName: "NO Contact",
        prefix: "R",
        showProperties: true,
        labelOffset: { x: -50, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -65, type: 'universal' },
            { id: 'out', x: 0, y: 65, type: 'universal' }
        ]
    },
    PushButtonNC: {
        Component: PushButtonNC,
        displayName: "Push Button NC",
        prefix: "S",
        showProperties: true,
        labelOffset: { x: -50, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -65, type: 'universal' },
            { id: 'out', x: 0, y: 65, type: 'universal' }
        ]
    },
    PushButtonNO: {
        Component: PushButtonNO,
        displayName: "Push Button NO",
        prefix: "S",
        showProperties: true,
        labelOffset: { x: -50, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -65, type: 'universal' },
            { id: 'out', x: 0, y: 65, type: 'universal' }
        ]
    },
    SinglePoleCB: {
        Component: SinglePoleCB,
        displayName: "1P Circuit Breaker",
        prefix: "MCB",
        showProperties: true,
        labelOffset: { x: -60, y: 0 },
        ports: [
            { id: 'in', x: -9, y: -65, type: 'universal' },
            { id: 'out', x: -9, y: 65, type: 'universal' }
        ]
    },
    ThreePoleCB: {
        Component: ThreePoleCB,
        displayName: "3P Circuit Breaker",
        prefix: "MCB",
        showProperties: true,
        labelOffset: { x: -100, y: 0 },
        ports: [
            { id: 'L1_in', x: -50, y: -65, type: 'universal' },
            { id: 'L2_in', x: 0, y: -65, type: 'universal' },
            { id: 'L3_in', x: 50, y: -65, type: 'universal' },
            { id: 'L1_out', x: -50, y: 64, type: 'universal' },
            { id: 'L2_out', x: 0, y: 64, type: 'universal' },
            { id: 'L3_out', x: 50, y: 64, type: 'universal' }
        ]
    },
    ContactorMainContacts: {
        Component: ContactorMainContacts,
        displayName: "Main Contacts",
        prefix: "K",
        showProperties: true,
        labelOffset: { x: -100, y: 0 },
        ports: [
            { id: 'L1_in', x: -50, y: -65, type: 'universal' },
            { id: 'L2_in', x: 0, y: -65, type: 'universal' },
            { id: 'L3_in', x: 50, y: -65, type: 'universal' },
            { id: 'L1_out', x: -50, y: 64, type: 'universal' },
            { id: 'L2_out', x: 0, y: 64, type: 'universal' },
            { id: 'L3_out', x: 50, y: 64, type: 'universal' }
        ]
    },
    SimpleMotor: {
        Component: SimpleMotor,
        displayName: "Simple Motor",
        prefix: "M",
        showProperties: true,
        labelOffset: { x: -120, y: 0 },
        ports: [
            { id: 'U', x: -50, y: -110, type: 'universal' },
            { id: 'V', x: 0, y: -110, type: 'universal' },
            { id: 'W', x: 50, y: -110, type: 'universal' }
        ]
    },
    AdvancedMotor: {
        Component: AdvancedMotor,
        displayName: "Advanced Motor",
        prefix: "M",
        showProperties: true,
        labelOffset: { x: -120, y: 0 },
        ports: [
            { id: 'U1', x: -50, y: -130, type: 'universal' },
            { id: 'V1', x: 0, y: -130, type: 'universal' },
            { id: 'W1', x: 50, y: -130, type: 'universal' },
            { id: 'U2', x: -50, y: 130, type: 'universal' },
            { id: 'V2', x: 0, y: 130, type: 'universal' },
            { id: 'W2', x: 50, y: 130, type: 'universal' }
        ]
    },
    OnDelayTimer: {
        Component: OnDelayTimer,
        displayName: "On Delay Timer",
        prefix: "T",
        showProperties: true,
        labelOffset: { x: -100, y: 0 },
        ports: [
            { id: 'in', x: 0, y: -75, type: 'universal' },
            { id: 'out', x: 0, y: 75, type: 'universal' }
        ]
    }
}