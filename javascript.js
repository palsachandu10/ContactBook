let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let editIndex = null;
let sortOrder = "asc";
function render() {
    const container = document.getElementById("contactContainer");
    const sidebar = document.getElementById("sidebarList");
    const searchValue = document
        .getElementById("search")
        .value
        .toLowerCase();

    container.innerHTML = "";
    sidebar.innerHTML = "";

    let filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchValue) ||
        contact.mobile.includes(searchValue) ||
        (contact.email && contact.email.toLowerCase().includes(searchValue))
    );

    filtered.sort((a, b) => {
        return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
    });

    const sidebarCount = document.getElementById("sidebarCount");
    if (sidebarCount) {
        sidebarCount.textContent = filtered.length + " Contacts";
    }

    if (filtered.length === 0) {
        container.innerHTML =
            "<div class='empty-state'>No contacts available</div>";
        return;
    }

    const favourites = filtered.filter(contact => contact.fav);

    if (favourites.length > 0) {
        container.innerHTML +=
            "<div class='section-title'>⭐ Favourites</div>";

        favourites.forEach(contact => {
            createCard(contact, contacts.indexOf(contact));
        });
    }

    let grouped = {};

    filtered.forEach(contact => {
        const letter = contact.name.charAt(0).toUpperCase();

        if (!grouped[letter]) {
            grouped[letter] = [];
        }

        grouped[letter].push(contact);
    });

    for (let letter in grouped) {

        container.innerHTML +=
            `<div class='section-title'>${letter}</div>`;

        grouped[letter].forEach(contact => {
            createCard(contact, contacts.indexOf(contact));
        });

        sidebar.innerHTML +=
            `<div class='letter'>${letter}</div>`;

        grouped[letter].forEach(contact => {
            sidebar.innerHTML += `
                <div class="sidebar-contact">
                    <strong>${contact.name}</strong>
                    <small>${contact.mobile}</small>
                    <small>${contact.email || ""}</small>
                </div>
            `;
        });
    }
}

function saveToStorage() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function createCard(contact, index) {

    const container = document.getElementById("contactContainer");

    const avatarContent = contact.profilePic
        ? `<img src="${contact.profilePic}" class="profile-img">`
        : contact.name.charAt(0).toUpperCase();

    container.innerHTML += `
        <div class="contact-card">

            <div class="contact-left">
                <div class="avatar">
                    ${avatarContent}
                </div>

                <div class="contact-info">
                    <strong>${contact.name}</strong>

                    <div class="fav-email">
                        ${contact.fav ? "⭐" : ""}
                        <small>${contact.email || ""}</small>
                    </div>
                </div>
            </div>

            <div class="contact-right">
                <div class="mobile-line">
                    <strong>${contact.mobile}</strong>
                    <a href="tel:${contact.mobile}">
                        <i class="fa-solid fa-phone call-icon"></i>
                    </a>
                </div>

                <small>${contact.email || ""}</small>
            </div>

            <div class="actions">
                <span 
                    onclick="toggleFav(${index})"
                    style="color:${contact.fav ? '#f4b400' : '#aaa'}"
                >
                    ${contact.fav ? "★" : "☆"}
                </span>

                <span onclick="editContact(${index})">✏️</span>
                <span onclick="deleteContact(${index})">🗑️</span>
            </div>

        </div>
    `;
}

function openModal() {
    editIndex = null;
    document.getElementById("modalTitle").textContent = "Add Contact";
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";

    document.getElementById("name").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("email").value = "";
    document.getElementById("profilePic").value = "";
}

function saveContact() {

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const email = document.getElementById("email").value.trim();
    const fileInput = document.getElementById("profilePic");

    if (!name || !mobile) {
        alert("Name and Mobile are required.");
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        alert("Mobile number must be exactly 10 digits.");
        return;
    }

    if (fileInput.files[0]) {

        const reader = new FileReader();

        reader.onload = function (e) {
            saveData(e.target.result);
        };

        reader.readAsDataURL(fileInput.files[0]);

    } else {

        const existingPic =
            editIndex !== null
                ? contacts[editIndex].profilePic
                : "";

        saveData(existingPic);
    }

    function saveData(imageData) {

        const contact = {
            name,
            mobile,
            email,
            profilePic: imageData,
            fav: editIndex !== null
                ? contacts[editIndex].fav
                : false
        };

        if (editIndex === null) {
            contacts.push(contact);
        } else {
            contacts[editIndex] = contact;
        }

        saveToStorage();
        closeModal();
        render();
    }
}

function deleteContact(index) {
    if (confirm("Delete this contact?")) {
        contacts.splice(index, 1);
        saveToStorage();
        render();
    }
}

function editContact(index) {

    const contact = contacts[index];
    editIndex = index;

    document.getElementById("modalTitle").textContent = "Edit Contact";
    document.getElementById("name").value = contact.name;
    document.getElementById("mobile").value = contact.mobile;
    document.getElementById("email").value = contact.email;
    document.getElementById("profilePic").value = "";

    document.getElementById("modal").style.display = "flex";
}

function toggleFav(index) {
    contacts[index].fav = !contacts[index].fav;
    saveToStorage();
    render();
}

function setSort(order, event) {

    sortOrder = order;

    document.querySelectorAll(".sort-btn")
        .forEach(btn => btn.classList.remove("active"));

    event.target.classList.add("active");

    render();
}

document
    .getElementById("search")
    .addEventListener("input", render);

render();