(function() {
    // === CONFIGURATION ===
    const BIRTHDATE = new Date('1994-05-12T00:00:00Z');

    // === HASH UTILITIES ===
    // Simple integer hash (XOR shift)
    function hashInt(n) {
        let x = n;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        // ensure positive
        return Math.abs(x);
    }

    // === ENGINE ===
    function runFogEngine() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        const dateKey = year * 10000 + month * 100 + day;
        const hash = hashInt(hashInt(dateKey));
        const intensity = hash % 100;

        let fogState = 'none';
        let sigStrength = 100;
        let resonance = 0; // base resonance on clear day? Not specified, maybe 0.

        if (intensity >= 95) {
            fogState = 'major';
            sigStrength = 44;
            resonance = 237;
        } else if (intensity >= 85) {
            fogState = 'moderate';
            sigStrength = 71;
            resonance = 218;
        } else if (intensity >= 70) {
            fogState = 'minor';
            sigStrength = 87;
            resonance = 204;
        } else {
            // No fog, but calculate base resonance based on hash
            resonance = 12 + (hash % 20);
        }

        // Apply to DOM
        document.body.setAttribute('data-fog', fogState);
        document.body.setAttribute('data-fog-intensity', intensity);

        // Update telemetry
        const sigEls = document.querySelectorAll('.telemetry-sig');
        sigEls.forEach(el => el.textContent = `SIG.${sigStrength}`);

        // Update resonance text
        const resEls = document.querySelectorAll('.telemetry-res');
        resEls.forEach(el => {
            el.innerHTML = `<span id="res-value">${resonance}</span>/240 RES`;
        });

        // Handle fog-uncertain elements
        if (fogState !== 'none') {
            const uncertainEls = document.querySelectorAll('.fog-uncertain');
            uncertainEls.forEach(el => el.classList.add('fog-uncertain-active'));
        }
    }

    // === LIVE HUD ===
    function getMoonPhase(year, month, day) {
        let c = 0, e = 0, jd = 0, b = 0;
        if (month < 3) {
            year--;
            month += 12;
        }
        ++month;
        c = 365.25 * year;
        e = 30.6 * month;
        jd = c + e + day - 694039.09;
        jd /= 29.5305882;
        b = parseInt(jd);
        jd -= b;
        b = Math.round(jd * 8);
        if (b >= 8) b = 0;
        const phases = ['🌑 NEW MOON', '🌒 WAXING CRESCENT', '🌓 FIRST QUARTER', '🌔 WAXING GIBBOUS', '🌕 FULL MOON', '🌖 WANING GIBBOUS', '🌗 LAST QUARTER', '🌘 WANING CRESCENT'];
        return phases[b];
    }

    function updateClock() {
        const now = new Date();
        
        // Update Time
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            clockEl.textContent = timeString;
        }

        // Update Ticker Date & Moon
        const tickerDateEl = document.getElementById('ticker-date');
        const tickerMoonEl = document.getElementById('ticker-moon');
        
        if (tickerDateEl) {
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            
            const dayName = days[now.getDay()];
            const monthName = months[now.getMonth()];
            const dateStr = `${dayName} &middot; ${monthName} ${now.getDate()} &middot; ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;
            tickerDateEl.innerHTML = dateStr;
        }

        if (tickerMoonEl) {
            tickerMoonEl.textContent = getMoonPhase(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }
    }

    function calculateAgeAndXP() {
        const now = new Date();
        
        // Calculate years (LV)
        let age = now.getFullYear() - BIRTHDATE.getFullYear();
        const m = now.getMonth() - BIRTHDATE.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < BIRTHDATE.getDate())) {
            age--;
        }

        const ageEl = document.getElementById('age');
        if (ageEl) ageEl.textContent = age;

        // Calculate XP (progress to next birthday)
        const lastBday = new Date(now.getFullYear() - (m < 0 || (m === 0 && now.getDate() < BIRTHDATE.getDate()) ? 1 : 0), BIRTHDATE.getMonth(), BIRTHDATE.getDate());
        const nextBday = new Date(lastBday.getFullYear() + 1, BIRTHDATE.getMonth(), BIRTHDATE.getDate());
        
        const totalMs = nextBday - lastBday;
        const elapsedMs = now - lastBday;
        const xpPercent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

        const xpFill = document.querySelector('.xp-fill');
        if (xpFill) {
            xpFill.style.width = `${xpPercent}%`;
        }
    }

    // === INITIALIZATION ===
    document.addEventListener('DOMContentLoaded', () => {
        runFogEngine();
        updateClock();
        calculateAgeAndXP();

        // Update clock every 15 seconds
        setInterval(updateClock, 15000);
    });
})();
