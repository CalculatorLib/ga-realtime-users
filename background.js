const POLLING_INTERVAL = 10000; // 10 seconds
let monitoredProperties = new Map();
let pollInterval = null;

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open welcome page when extension is installed
        chrome.tabs.create({
            url: 'https://calculatorlib.com/?screen=install&utm_source=chrome-extension'
        });
    }
});

// Uninstallation URL
chrome.runtime.setUninstallURL('https://calculatorlib.com/?screen=uninstall&utm_source=chrome-extension', () => {
    if (chrome.runtime.lastError) {
        console.error('Error setting uninstall URL:', chrome.runtime.lastError);
    }
});

// Initialize properties from storage
chrome.storage.local.get(['monitoredProperties'], (result) => {
    if (result.monitoredProperties) {
        monitoredProperties = new Map(JSON.parse(result.monitoredProperties));
        startPolling();
    }
});

function formatBadgeNumber(number) {
    if (number >= 1000000) {
        // For millions
        const millions = Math.floor(number / 1000000);
        const decimal = Math.floor((number % 1000000) / 100000);
        return `${millions},${decimal}m`;
    } else if (number >= 1000) {
        // For thousands
        const thousands = Math.floor(number / 1000);
        const decimal = Math.floor((number % 1000) / 100);
        return `${thousands},${decimal}k`;
    }
    return number.toString();
}

function updateBadgeAndTooltip(properties) {
    const totalUsers = properties.reduce((sum, prop) => {
        return sum + (prop.error ? 0 : (prop.activeUsers || 0));
    }, 0);

    // Format badge text
    const badgeText = formatBadgeNumber(totalUsers);

    // Update badge
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' });

    // Update tooltip with full numbers
    const tooltipText = properties.length === 0 ? 'No properties monitored' :
        properties.map(p => {
            const userCount = p.error ? 'Error' :
                `${formatBadgeNumber(p.activeUsers || 0)} (${(p.activeUsers || 0).toLocaleString()})`;
            return `${p.name}: ${userCount} users`;
        }).join('\n');

    chrome.action.setTitle({ title: tooltipText });
}

async function getGAData(propertyId) {
    try {
        // First try non-interactive token
        let token = await getAuthToken(false);

        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metrics: [{name: 'activeUsers'}],
                    minuteRanges: [{
                        name: 'current',
                        startMinutesAgo: 29,
                        endMinutesAgo: 0
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`GA API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const activeUsers = data.rows?.[0]?.metricValues?.[0]?.value || '0';

        return {
            success: true,
            activeUsers: parseInt(activeUsers)
        };
    } catch (error) {
        console.error('Error fetching GA data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

function getAuthToken(interactive = false) {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive }, function(token) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

async function pollAllProperties() {
    const updatedProperties = [];

    for (const [propertyId, property] of monitoredProperties) {
        const result = await getGAData(propertyId);

        const updatedProperty = {
            ...property,
            activeUsers: result.success ? result.activeUsers : undefined,
            error: result.success ? undefined : result.error
        };

        monitoredProperties.set(propertyId, updatedProperty);
        updatedProperties.push(updatedProperty);
    }

    // Update badge and tooltip
    updateBadgeAndTooltip(updatedProperties);

    // Notify popup if it's open
    chrome.runtime.sendMessage({
        action: "updateData",
        properties: updatedProperties
    }).catch(() => {
        // Ignore errors when popup is closed
    });
}

function startPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
    }

    if (monitoredProperties.size > 0) {
        pollAllProperties();
        pollInterval = setInterval(pollAllProperties, POLLING_INTERVAL);
    } else {
        updateBadgeAndTooltip([]);
    }
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "userLoggedOut") {
        // Clear polling
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }

        // Reset badge
        updateBadgeAndTooltip([]);

        // Clear monitored properties
        monitoredProperties.clear();

        // Clear storage
        chrome.storage.local.remove('monitoredProperties');
    } else if (request.action === "clearIdentityToken") {
        // Force clear identity
        chrome.identity.clearAllCachedAuthTokens(() => {
            console.log('All auth tokens cleared');
        });
    } else if (request.action === "propertiesUpdated") {
        monitoredProperties = new Map(request.properties.map(p => [p.id, p]));
        startPolling();
    } else if (request.action === "requestData") {
        pollAllProperties();
    }
});

// Handle extension updates/installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: '0' });
    chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' });
});

// Handle startup
chrome.runtime.onStartup.addListener(() => {
    startPolling();
});