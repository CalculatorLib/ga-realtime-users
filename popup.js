let monitoredProperties = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    loadProperties();
    await updateUserInfo();
});

function loadProperties() {
    chrome.storage.local.get(['monitoredProperties'], (result) => {
        if (result.monitoredProperties) {
            monitoredProperties = new Map(JSON.parse(result.monitoredProperties));
            renderProperties();
            requestUpdate();
        }
    });
}

async function updateUserInfo() {
    const logoutBtn = document.getElementById('logoutBtn');

    try {
        const token = await getAuthToken();
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch user info');

        const data = await response.json();
        document.getElementById('userEmail').textContent = data.email;
        logoutBtn.style.display = 'block'; // Show logout button when signed in
    } catch (error) {
        console.error('Error fetching user info:', error);
        document.getElementById('userEmail').textContent = 'Not signed in';
        logoutBtn.style.display = 'none'; // Hide logout button when not signed in
    }
}

// Load saved properties
chrome.storage.local.get(['monitoredProperties'], (result) => {
    if (result.monitoredProperties) {
        monitoredProperties = new Map(JSON.parse(result.monitoredProperties));
        renderProperties();
        requestUpdate();
    }
});

// Listen for updates from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateData") {
        updatePropertyData(request.properties);
    }
});

function updatePropertyData(properties) {
    properties.forEach(property => {
        if (monitoredProperties.has(property.id)) {
            monitoredProperties.set(property.id, {
                ...monitoredProperties.get(property.id),
                activeUsers: property.activeUsers,
                error: property.error
            });
        }
    });
    renderProperties();
}

function renderProperties() {
    const container = document.getElementById('propertiesList');

    if (monitoredProperties.size === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div>No properties added</div>
        <div style="font-size: 13px; margin-top: 4px;">Add your first property below</div>
      </div>
    `;
        return;
    }

    let html = '';
    monitoredProperties.forEach((property) => {
        const userCount = property.error ?
            `<div style="color: #c5221f; font-size: 13px;">Error: ${property.error}</div>` :
            `<div class="user-count">${property.activeUsers || 0} <span style="font-size: 14px; color: #5f6368;">users</span></div>`;

        html += `
      <div class="property-card">
        <div class="property-name">${property.name}</div>
        <div class="property-id">ID: ${property.id}</div>
        ${userCount}
        <button class="remove-btn" data-property-id="${property.id}" 
                style="background: #dc3545; float: right; margin-top: -40px;">
          Remove
        </button>
      </div>
    `;
    });

    container.innerHTML = html;

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const propertyId = e.target.dataset.propertyId;
            await removeProperty(propertyId);
        });
    });
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        // Get current token
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(token);
                }
            });
        });

        if (token) {
            // Revoke token with Google
            await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);

            // Remove token from Chrome's cache
            await new Promise((resolve, reject) => {
                chrome.identity.removeCachedAuthToken({ token }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Clear all cached auth tokens
        await new Promise((resolve, reject) => {
            chrome.identity.clearAllCachedAuthTokens(() => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });

        // Clear local properties
        monitoredProperties.clear();
        await saveProperties();

        // Update UI
        renderProperties();
        await updateUserInfo(); // This will hide the logout button

        showStatus('Successfully signed out', 'success');

        // Notify a background script
        chrome.runtime.sendMessage({ action: "userLoggedOut" });

        // Force token refresh on next login attempt
        chrome.runtime.sendMessage({ action: "clearIdentityToken" });

    } catch (error) {
        console.error('Logout error:', error);
        showStatus('Error signing out: ' + error.message, 'error');
    }
});

document.getElementById('addPropertyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const propertyId = document.getElementById('propertyId').value;
    const propertyName = document.getElementById('propertyName').value;

    try {
        // Validate property ID
        const token = await getAuthToken();
        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metrics: [{name: 'activeUsers'}]
                })
            }
        );

        if (!response.ok) {
            throw new Error('Invalid property ID or no access');
        }

        monitoredProperties.set(propertyId, {
            id: propertyId,
            name: propertyName,
            activeUsers: 0
        });

        await saveProperties();
        e.target.reset();
        showStatus('Property added successfully', 'success');
        requestUpdate();
    } catch (error) {
        showStatus(error.message, 'error');
    }
});

async function removeProperty(propertyId) {
    monitoredProperties.delete(propertyId);
    await saveProperties();
    renderProperties();
}

async function saveProperties() {
    const propertiesData = JSON.stringify(Array.from(monitoredProperties.entries()));
    await chrome.storage.local.set({ monitoredProperties: propertiesData });

    chrome.runtime.sendMessage({
        action: "propertiesUpdated",
        properties: Array.from(monitoredProperties.values())
    });
}

function requestUpdate() {
    chrome.runtime.sendMessage({ action: "requestData" });
}

function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, async function(token) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                try {
                    // Verify token is still valid
                    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (!response.ok) {
                        // Token is invalid, remove it and try again
                        await new Promise((resolve) => {
                            chrome.identity.removeCachedAuthToken({ token }, resolve);
                        });
                        // Recursive call to get a new token
                        resolve(await getAuthToken());
                    } else {
                        resolve(token);
                    }
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}


function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}