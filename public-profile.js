'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const trainerEmail = urlParams.get('email');

    if (!trainerEmail) {
        showError('No trainer specified in the URL.');
        return;
    }

    // Uses the existing /api/users/:email route (handles email lookup natively)
    fetch(`/api/users/${encodeURIComponent(trainerEmail)}`)
        .then(res => {
            if (!res.ok) throw new Error('Trainer not found');
            return res.json();
        })
        .then(data => renderPublicProfile(data))
        .catch(err => {
            console.error('Could not fetch trainer profile:', err);
            showError('This trainer profile could not be loaded.');
        });
});

function renderPublicProfile(data) {
    // Basic fields — all with safe fallbacks
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.fullName || 'Trainer';
    document.getElementById('pub-name').innerText = fullName;
    document.getElementById('pub-tagline').innerText = data.professionalTitle || data.tagline || '';
    document.getElementById('pub-bio').innerText = data.bio || 'No biography provided.';

    // Profile photo
    const photo = document.getElementById('pub-photo');
    if (photo) photo.src = data.profilePictureUrl || data.profilePic || data.img || 'img/default-avatar.svg';

    // Achievements / Certificates
    const certList = document.getElementById('pub-certs-list');
    if (certList) {
        const certs = Array.isArray(data.achievements) ? data.achievements
                    : Array.isArray(data.certificates) ? data.certificates
                    : [];
        if (certs.length === 0) {
            certList.innerHTML = '<p style="color:#999">No achievements listed yet.</p>';
        } else {
            certList.innerHTML = certs.map(cert => `
                <div class="cert-item">
                    <strong>${cert.title || cert.name || 'Untitled'}</strong>
                    <p>${cert.sub || cert.issuer || ''} ${cert.year ? '(' + cert.year + ')' : ''}</p>
                </div>
            `).join('');
        }
    }
}

function showError(msg) {
    const container = document.querySelector('.profile-container');
    if (container) container.innerHTML = `<h2 style="color:#ccc;text-align:center;padding:60px">${msg}</h2>`;
}