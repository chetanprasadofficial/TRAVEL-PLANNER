document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    const path = window.location.pathname;
    const isRestricted = path.includes('dashboard.html') || path.includes('itinerary.html');
    const user = localStorage.getItem('yatra_user');

    if (isRestricted && !user) {
        window.location.href = 'login.html';
    }

    updateNavbar(user);
});

function updateNavbar(user) {
    const navList = document.querySelector('.nav-links');
    if (!navList) return;

    const oldDash = document.getElementById('nav-dash');
    if (oldDash && oldDash.parentElement) oldDash.parentElement.remove();
    const oldProf = document.getElementById('nav-prof');
    if (oldProf && oldProf.parentElement) oldProf.parentElement.remove();
    const oldLogout = document.getElementById('nav-logout');
    if (oldLogout && oldLogout.parentElement) oldLogout.parentElement.remove();
    const oldLogin = document.getElementById('nav-login');
    if (oldLogin && oldLogin.parentElement) oldLogin.parentElement.remove();

    if (user) {
        const liDash = document.createElement('li');
        liDash.innerHTML = '<a href="dashboard.html" id="nav-dash">Dashboard</a>';
        navList.appendChild(liDash);

        const liLogout = document.createElement('li');
        liLogout.innerHTML = '<a href="#" id="nav-logout" onclick="logout()">Logout</a>';
        navList.appendChild(liLogout);
    } else {
        const liLogin = document.createElement('li');
        liLogin.innerHTML = '<a href="login.html" id="nav-login">Login</a>';
        navList.appendChild(liLogin);
    }
}

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

    let userDB = JSON.parse(localStorage.getItem('yatra_users_db') || "{}");

    if (isSignup) {
        if (userDB[username]) {
            alert("Username already taken!");
            return;
        }

        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;

        userDB[username] = {
            password: password,
            name: fullName,
            phone: phone,
            joined: new Date().toLocaleDateString()
        };

        localStorage.setItem('yatra_users_db', JSON.stringify(userDB));
        localStorage.setItem('yatra_user', username);

        alert("Registration successful");
        window.location.href = 'dashboard.html';

    } else {
        const userRecord = userDB[username];

        if (!userRecord || userRecord.password !== password) {
            alert("Invalid Username or Password");
            return;
        }

        localStorage.setItem('yatra_user', username);
        alert("Login successful");
        window.location.href = 'dashboard.html';
    }
}

function handleRecovery() {
    const user = document.getElementById('recUser').value.trim();
    const phone = document.getElementById('recPhone').value.trim();

    if (!user || !phone) {
        alert("Please fill all fields");
        return;
    }

    const userDB = JSON.parse(localStorage.getItem('yatra_users_db') || "{}");
    const userRecord = userDB[user];

    if (userRecord && userRecord.phone === phone) {
        alert("Password: " + userRecord.password);
    } else {
        alert("Verification failed");
    }
}

function logout() {
    if (confirm("Logout?")) {
        localStorage.removeItem('yatra_user');
        window.location.href = 'index.html';
    }
}

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
    }
}

function savePlan() {
    const dest = document.getElementById('destCity').value;
    const days = document.getElementById('tripDays').value;
    const people = document.getElementById('travelers').value;

    if (!dest || !days || !people) {
        alert("Fill all fields");
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

    window.location.href = `itinerary.html?id=${newTrip.id}`;
}

function loadDashboard() {
    const user = localStorage.getItem('yatra_user');
    if (user) document.getElementById('userDisplay').innerText = user;

    const plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");
    const container = document.getElementById('plansContainer');

    if (plans.length === 0) {
        container.innerHTML = "<p>No plans found</p>";
        return;
    }

    let html = `<table class="dashboard-table"><thead><tr>
        <th>Destination</th><th>Days</th><th>Travelers</th><th>Date</th><th>Action</th>
        </tr></thead><tbody>`;

    plans.forEach(plan => {
        html += `<tr>
            <td>${plan.destination}</td>
            <td>${plan.days}</td>
            <td>${plan.travelers}</td>
            <td>${plan.date}</td>
            <td>
                <a href="itinerary.html?id=${plan.id}" class="btn btn-primary">View</a>
                <button onclick="deletePlan(${plan.id})" class="btn btn-warning">Delete</button>
            </td>
        </tr>`;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
}

function deletePlan(id) {
    let plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");
    plans = plans.filter(p => p.id !== id);
    localStorage.setItem('yatra_plans', JSON.stringify(plans));
    loadDashboard();
}

function loadItinerary() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");

    let trip = id ? plans.find(p => p.id == id) : plans[plans.length - 1];
    if (!trip) return;

    localStorage.setItem('yatra_current_trip_id', trip.id);
    document.getElementById('tripTitle').innerText = trip.destination;

    let html = "";
    for (let i = 1; i <= trip.days; i++) {
        html += `<div class="day-card"><h3>Day ${i}</h3><p>Planned activities</p></div>`;
    }
    document.getElementById('itineraryList').innerHTML = html;
}

function calculateCost() {
    const hotel = parseFloat(document.getElementById('hotelPrice').value) || 0;
    const food = parseFloat(document.getElementById('foodPrice').value) || 0;
    const transport = parseFloat(document.getElementById('transportPrice').value) || 0;

    const currentId = localStorage.getItem('yatra_current_trip_id');
    const plans = JSON.parse(localStorage.getItem('yatra_plans') || "[]");
    const trip = plans.find(p => p.id == currentId);

    const days = trip ? trip.days : 1;
    const people = trip ? trip.travelers : 1;

    const total = (hotel * days) + (food * people * days) + transport;
    document.getElementById('finalCost').innerText = "₹ " + total;
    document.getElementById('resultBox').style.display = "block";
}

const API_KEY = "8a7d30560946227b9c9912061986423c";

async function fetchWeather() {
    const city = document.getElementById('weatherInput').value;
    if (!city) return;

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
        const data = await res.json();

        document.getElementById('w-city').innerText = data.name;
        document.getElementById('w-temp').innerText = Math.round(data.main.temp);
        document.getElementById('w-desc').innerText = data.weather[0].description;
    } catch {
        alert("Weather data not found");
    }
}
