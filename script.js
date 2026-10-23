// Get HTML elements
const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");

const searchInput = document.getElementById("search");
const contactsContainer = document.getElementById("contactsContainer");
const contactCount = document.getElementById("contactCount");
const emptyMessage = document.getElementById("emptyMessage");

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Load saved contacts from Local Storage
let contacts = [];

try {
    const savedContacts = localStorage.getItem("contactBook");

    if (savedContacts) {
        const parsedContacts = JSON.parse(savedContacts);

        if (Array.isArray(parsedContacts)) {
            contacts = parsedContacts.filter(contact =>
                contact &&
                typeof contact.id === "string" &&
                typeof contact.name === "string" &&
                typeof contact.phone === "string" &&
                typeof contact.email === "string"
            );
        }
    }
} catch (error) {
    console.error("Could not load contacts:", error);
}

// Store the ID of the contact being edited
let editingId = null;


// Save contacts to Local Storage
function saveContacts() {
    try {
        localStorage.setItem("contactBook", JSON.stringify(contacts));
        return true;
    } catch (error) {
        alert("Unable to save contacts in this browser.");
        return false;
    }
}


// Display contacts
function displayContacts(list = contacts) {
    contactsContainer.replaceChildren();

    contactCount.textContent = `Total Contacts: ${contacts.length}`;

    emptyMessage.hidden = list.length !== 0;

    list.forEach(contact => {

        const card = document.createElement("div");
        card.className = "contact-card";

        const info = document.createElement("div");
        info.className = "contact-info";

        const name = document.createElement("h3");
        name.textContent = contact.name;

        const phone = document.createElement("p");
        phone.textContent = `📞 ${contact.phone}`;

        const email = document.createElement("p");
        email.textContent = `✉️ ${contact.email || "No email provided"}`;

        info.append(name, phone, email);

        const actions = document.createElement("div");
        actions.className = "contact-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editContact(contact.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteContact(contact.id);
        });

        actions.append(editButton, deleteButton);
        card.append(info, actions);

        contactsContainer.appendChild(card);
    });
}


// Add a new contact or update an existing one
contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !phone) {
        alert("Please enter the name and phone number.");
        return;
    }

    // Prevent duplicate phone numbers
    const duplicate = contacts.some(contact =>
        contact.phone.replace(/\D/g, "") === phone.replace(/\D/g, "") &&
        contact.id !== editingId
    );

    if (duplicate) {
        alert("A contact with this phone number already exists.");
        return;
    }

    let updatedContacts;

    if (editingId !== null) {

        updatedContacts = contacts.map(contact =>
            contact.id === editingId
                ? { ...contact, name, phone, email }
                : contact
        );

    } else {

        const newContact = {
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            name,
            phone,
            email
        };

        updatedContacts = [...contacts, newContact];
    }

    const previousContacts = contacts;
    contacts = updatedContacts;

    if (!saveContacts()) {
        contacts = previousContacts;
        return;
    }

    resetForm();
    displayContacts();
});


// Edit a contact
function editContact(id) {
    const contact = contacts.find(item => item.id === id);

    if (!contact) {
        return;
    }

    editingId = id;

    nameInput.value = contact.name;
    phoneInput.value = contact.phone;
    emailInput.value = contact.email;

    formTitle.textContent = "Edit Contact";
    submitBtn.textContent = "Update Contact";
    cancelBtn.hidden = false;

    nameInput.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Delete a contact
function deleteContact(id) {
    const contact = contacts.find(item => item.id === id);

    if (!contact) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete ${contact.name}?`
    );

    if (!confirmed) {
        return;
    }

    const previousContacts = contacts;
    contacts = contacts.filter(item => item.id !== id);

    if (!saveContacts()) {
        contacts = previousContacts;
        return;
    }

    if (editingId === id) {
        resetForm();
    }

    displayContacts();
}


// Search contacts
searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.trim().toLowerCase();

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchText) ||
        contact.phone.toLowerCase().includes(searchText) ||
        contact.email.toLowerCase().includes(searchText)
    );

    displayContacts(filteredContacts);
});


// Reset the form
function resetForm() {
    contactForm.reset();

    editingId = null;

    formTitle.textContent = "Add New Contact";
    submitBtn.textContent = "Add Contact";
    cancelBtn.hidden = true;
}


// Cancel editing
cancelBtn.addEventListener("click", resetForm);


// Display saved contacts when the page loads
displayContacts();