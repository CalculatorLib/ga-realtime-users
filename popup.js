let monitoredProperties = new Map();

const STAR_ICON_SVG = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
</svg>`;

document.addEventListener('DOMContentLoaded', async () => {
    loadProperties();
    await updateUserInfo();
});

async function checkAuthToken() {
    return new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
            resolve(token || null);
        });
    });
}

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
    const userEmailElement = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');

    try {
        const token = await checkAuthToken(); // Use non-interactive check
        if (!token) {
            throw new Error('No token');
        }

        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch user info');

        const data = await response.json();
        userEmailElement.textContent = data.email;
        logoutBtn.style.display = 'block';
    } catch (error) {
        console.error('Error fetching user info:', error);
        userEmailElement.textContent = 'Not signed in';
        logoutBtn.style.display = 'none';
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

// Listen for updates from a background script
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
        <div class="property-info">
            <div class="info">
                <div class="property-name">${property.name}</div>
                <div class="property-id">ID: <a style="text-decoration: none; color: #5f6368;" target="_blank" title="Open Google Analytics" href="https://analytics.google.com/analytics/web/#/p${property.id}/realtime/overview">${property.id}</a></div>
            </div>
            <div class="action">
                <div role="button" class="star-btn${property.favorite ? ' favorite' : ''}" 
                  data-property-id="${property.id}" tabindex="0">${STAR_ICON_SVG}</div>
            </div>
        </div>
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

    // Add event listeners for star buttons
    document.querySelectorAll('.star-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const propertyId = e.target.closest('.star-btn').dataset.propertyId;
            await toggleFavorite(propertyId);
        });
    });
}

async function toggleFavorite(propertyId) {
    const property = monitoredProperties.get(propertyId);
    if (property) {
        property.favorite = !property.favorite;
        monitoredProperties.set(propertyId, property);
        await saveProperties();
        renderProperties();
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const token = await checkAuthToken();
        if (token) {
            // Revoke token with Google
            await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);

            // Remove token from Chrome's cache
            await new Promise((resolve) => {
                chrome.identity.removeCachedAuthToken({ token }, resolve);
            });

            // Clear all cached auth tokens
            await new Promise((resolve) => {
                chrome.identity.clearAllCachedAuthTokens(resolve);
            });
        }

        // Clear local properties
        monitoredProperties.clear();
        await saveProperties();

        // Update UI
        renderProperties();
        await updateUserInfo();

        showStatus('Successfully signed out', 'success');

        // Notify background script
        chrome.runtime.sendMessage({ action: "userLoggedOut" });

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
        // Get token with interactive mode only when adding property
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(token);
                }
            });
        });

        // Validate property ID
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
            activeUsers: 0,
            favorite: false // Initialize favorite status
        });

        await saveProperties();
        e.target.reset();
        showStatus('Property added successfully', 'success');
        await updateUserInfo(); // Update UI to show user info
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