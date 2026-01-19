/*
    YatraVerse - Main JavaScript Logic (v2.1)
    -----------------------------------------
    Features:
    1. Authentication & Profile Logic
    2. Multi-Plan Management
    3. Dashboard & Routing
    4. UI Interactions
*/

// --- 0. UI INTERACTIONS ---
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    // Mobile Menu Toggle
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Check Auth on restricted pages (Consolidated: only dashboard and itinerary)
    const path = window.location.pathname;
    const isRestricted = path.includes('dashboard.html') || path.includes('itinerary.html');
    const user = localStorage.getItem('yatra_user');

    if (isRestricted && !user) {
        window.location.href = 'login.html';
    }

    // --- NEW: Global Navbar Update ---
    updateNavbar(user);
});

function updateNavbar(user) {
    const navList = document.querySelector('.nav-links');
    if (!navList) return;

    // In consolidated view, we simplify the dynamic links
    // First, remove old dynamic links if they exist (cleanup)
    const oldDash = document.getElementById('nav-dash');
    if (oldDash && oldDash.parentElement) oldDash.parentElement.remove();
    const oldProf = document.getElementById('nav-prof');
    if (oldProf && oldProf.parentElement) oldProf.parentElement.remove();
    const oldLogout = document.getElementById('nav-logout');
    if (oldLogout && oldLogout.parentElement) oldLogout.parentElement.remove();
    const oldLogin = document.getElementById('nav-login');
    if (oldLogin && oldLogin.parentElement) oldLogin.parentElement.remove();

    if (user) {
        // Logged In: Add Dashboard & Logout
        // Dashboard
        const liDash = document.createElement('li');
        liDash.innerHTML = '<a href="dashboard.html" id="nav-dash">Dashboard</a>';
        navList.appendChild(liDash);

        // Logout
        const liLogout = document.createElement('li');
        liLogout.innerHTML = '<a href="#" id="nav-logout" onclick="logout()">Logout</a>';
        navList.appendChild(liLogout);
    } else {
        // Logged Out: Add Login
        const liLogin = document.createElement('li');
        liLogin.innerHTML = '<a href="login.html" id="nav-login">Login</a>';
        navList.appendChild(liLogin);
    }
}


// --- 1. AUTHENTICATION & PROFILE LOGIC ---

function handleAuth() {
    const btnText = document.getElementById('authBtn').innerText;
    const isSignup = btnText.includes("Create");

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username.length < 3) {
        alert("Username too short!");
        return;
    }
    if (password.length < 1) {
        alert("Password required!");
        return;
    }

    // Load User Database
    let userDB = JSON.parse(localStorage.getItem('yatra_users_db') || "{}");

    if (isSignup) {
        // --- REGISTRATION ---
        if (userDB[username]) {
            alert("Username already taken! Please choose another codename.");
            return;
        }

        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;

        // Save new user to DB
        userDB[username] = {
            password: password, // In real app, hash this!
            name: fullName,
            phone: phone,
            joined: new Date().toLocaleDateString()
        };

        localStorage.setItem('yatra_users_db', JSON.stringify(userDB));
        localStorage.setItem('yatra_user', username); // Auto-login

        alert(`Identity Created: Agent ${username} registered successfully.`);
        window.location.href = 'dashboard.html';

    } else {
        // --- LOGIN ---
        const userRecord = userDB[username];

        // Security Check
        if (!userRecord || userRecord.password !== password) {
            alert("ACCESS DENIED: Invalid Username or Password.");
            return;
        }

        // Login Success
        localStorage.setItem('yatra_user', username);
        alert(`Welcome back, Pilot ${userRecord.name}!`);
        window.location.href = 'dashboard.html';
    }
}



function handleRecovery() {
    const user = document.getElementById('recUser').value.trim();
    const phone = document.getElementById('recPhone').value.trim();

    if (!user || !phone) {
        alert("Please enter both Codename and Phone Number.");
        return;
    }

    const userDB = JSON.parse(localStorage.getItem('yatra_users_db') || "{}");
    const userRecord = userDB[user];

    if (userRecord && userRecord.phone === phone) {
        alert(`IDENTITY VERIFIED. \n\nAccess Key (Password): ${userRecord.password}`);
    } else {
        alert("VERIFICATION FAILED. \n\nCodename and Phone Number do not match our records.");
    }
}

function logout() {
    if (confirm("End Session?")) {
        localStorage.removeItem('yatra_user');
        window.location.href = 'index.html';
    }
}

// Load Profile Data logic (From DB)
function loadProfile() {
    const currentUser = localStorage.getItem('yatra_user');
    if (!currentUser) return;

    const userDB = JSON.parse(localStorage.getItem('yatra_users_db') || "{}");
    const profile = userDB[currentUser];

    if (profile) {
        document.getElementById('p-name').innerText = profile.name;
        document.getElementById('p-username').innerText = currentUser;
        document.getElementById('p-phone').innerText = profile.phone;
        document.getElementById('p-joined').innerText = profile.joined;
    } else {
        // Fallback (Should rarely happen if DB is consistent)
        document.getElementById('p-name').innerText = "Unknown Agent";
    }
}


// --- 2. TRIP SAVE LOGIC (MULTI-PLAN) ---

function savePlan() {
    const dest = document.getElementById('destCity').value;
    const days = document.getElementById('tripDays').value;
    const people = document.getElementById('travelers').value;

    if (!dest || !days || !people) {
        alert("Please fill all fields!");
        return;
    }

    const newTrip = {
        id: Date.now(),
        destination: dest,
        days: parseInt(days),
        travelers: parseInt(people),
        date: new Date().toLocaleDateString()
    };

    let plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");
    plans.push(newTrip);
    localStorage.setItem('yatra_plans', JSON.stringify(plans));

    alert("Plan Saved! Generating Itinerary...");
    window.location.href = `itinerary.html?id=${newTrip.id}`;
}


// --- 3. DASHBOARD LOGIC ---

function loadDashboard() {
    const user = localStorage.getItem('yatra_user');
    if (user) document.getElementById('userDisplay').innerText = user;

    const plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");
    const container = document.getElementById('plansContainer');

    if (plans.length === 0) {
        container.innerHTML = "<p class='text-center'>No missions found. Start by creating a plan!</p>";
        return;
    }

    let html = `
        <table class="dashboard-table">
            <thead>
                <tr>
                    <th>Destination</th>
                    <th>Days</th>
                    <th>Travelers</th>
                    <th>Created</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    plans.forEach(plan => {
        html += `
            <tr>
                <td>${plan.destination}</td>
                <td>${plan.days}</td>
                <td>${plan.travelers}</td>
                <td>${plan.date}</td>
                <td>
                    <a href="itinerary.html?id=${plan.id}" class="btn btn-primary action-btn">View</a>
                    <button onclick="deletePlan(${plan.id})" class="btn btn-warning action-btn">Delete</button>
                </td>
            </tr>
        `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
}

function deletePlan(id) {
    if (!confirm("Abort this mission? Data will be lost.")) return;

    let plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");
    plans = plans.filter(p => p.id !== id);
    localStorage.setItem('yatra_plans', JSON.stringify(plans));
    loadDashboard();
}


// --- 4. ITINERARY LOGIC ---

function loadItinerary() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");

    let trip = null;
    if (id) trip = plans.find(p => p.id == id);
    else trip = plans.length > 0 ? plans[plans.length - 1] : null;

    const container = document.getElementById('itineraryList');
    const titleSpan = document.getElementById('tripTitle');

    if (!trip) {
        if (container) container.innerHTML = "<p class='text-center text-danger'>Mission Data Missing. <a href='planner.html'>Create Plan</a></p>";
        return;
    }

    localStorage.setItem('yatra_current_trip_id', trip.id);
    if (titleSpan) titleSpan.innerText = trip.destination;

    let html = "";
    for (let i = 1; i <= trip.days; i++) {
        let activity = "Relax and Leisure";
        if (i === 1) activity = "Arrival, Hotel Check-in, and Rest";
        else if (i === trip.days) activity = "Souvenir Shopping and Departure";
        else if (i % 2 === 0) activity = "Sightseeing: Famous Museums and Parks";
        else activity = "Adventure: Local Markets and Street Food";
        html += `
            <div class="day-card">
                <h3 class="text-primary"><i class="fas fa-calendar-day"></i> Day ${i}</h3>
                <p>${activity}</p>
            </div>
        `;
    }
    if (container) container.innerHTML = html;
}

// --- 5. BUDGET LOGIC ---

function calculateCost() {
    const hotel = parseFloat(document.getElementById('hotelPrice').value) || 0;
    const food = parseFloat(document.getElementById('foodPrice').value) || 0;
    const transport = parseFloat(document.getElementById('transportPrice').value) || 0;

    const currentId = localStorage.getItem('yatra_current_trip_id');
    const plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");

    let days = 1;
    let people = 1;
    const trip = plans.find(p => p.id == currentId) || (plans.length > 0 ? plans[plans.length - 1] : null);

    if (trip) { days = trip.days; people = trip.travelers; }

    const grandTotal = (hotel * days) + (food * people * days) + transport;

    document.getElementById('finalCost').innerText = "₹ " + grandTotal;
    const resBox = document.getElementById('resultBox');
    if (resBox) resBox.style.display = "block";
}

// --- 6. WEATHER API (Unchanged) ---
const API_KEY = "8a7d30560946227b9c9912061986423c";

async function fetchWeather() {
    const city = document.getElementById('weatherInput').value;
    const resultDiv = document.getElementById('weatherResult');
    const errorDiv = document.getElementById('weatherError');

    if (!city) { alert("Enter city name"); return; }

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);

        document.getElementById('w-city').innerText = data.name;
        document.getElementById('w-temp').innerText = Math.round(data.main.temp);
        document.getElementById('w-desc').innerText = data.weather[0].description;

        resultDiv.classList.remove('d-none');
        errorDiv.classList.add('d-none');
    } catch (err) {
        console.error(err);
        errorDiv.innerText = "City not found or Network Error";
        errorDiv.classList.remove('d-none');
        resultDiv.classList.add('d-none');
    }
}
