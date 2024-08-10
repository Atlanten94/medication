document.addEventListener("DOMContentLoaded", function() {
    const popupForm = document.getElementById("popupForm");
    const openFormBtn = document.getElementById("openFormBtn");
    const closeBtn = document.getElementsByClassName("closeBtn")[0];
    const addMedBtn = document.getElementById("addMedBtn");
    let isEditing = false; // Zustand, um zu überprüfen, ob wir im Bearbeitungsmodus sind
    let currentRow; // Zeile, die bearbeitet wird
    let nextId = 1; // Zähler für die eindeutige ID

    // Firebase-Konfiguration und Initialisierung
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
    import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
    const firebaseConfig = {
        apiKey: "AIzaSyDcWNv5A0JUnaprb3dMoCGwKpQEaxiku9c",
        authDomain: "sl01-aufgaben.firebaseapp.com",
        databaseURL: "https://sl01-aufgaben-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "sl01-aufgaben",
        storageBucket: "sl01-aufgaben.appspot.com",
        messagingSenderId: "407438028848",
        appId: "1:407438028848:web:d633a796db7d8bcbf1fdf5",
        measurementId: "G-F4HJBTKS19"
    };
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // Höchste ID ermitteln
    function getMaxId(callback) {
        const dataRef = ref(database, 'medications');
        onValue(dataRef, (snapshot) => {
            let maxId = 0;
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const id = parseInt(data.id);
                if (id > maxId) {
                    maxId = id;
                }
            });
            callback(maxId);
        }, {
            onlyOnce: true // Dies wird nur einmal ausgeführt, um die höchste ID zu ermitteln
        });
    }

    // Öffnet das Popup-Formular
    openFormBtn.onclick = function() {
        popupForm.style.display = "flex";
        isEditing = false; // Setze den Modus auf Hinzufügen
        document.getElementById("id").value = ""; // ID bei Hinzufügen zurücksetzen
    }

    // Schließt das Popup-Formular
    closeBtn.onclick = function() {
        popupForm.style.display = "none";
    }

    // Schließt das Popup-Formular, wenn außerhalb geklickt wird
    window.onclick = function(event) {
        if (event.target == popupForm) {
            popupForm.style.display = "none";
        }
    }

    // Fügt eine neue Zeile zur Tabelle hinzu, wenn das Formular gesendet wird
    addMedBtn.onclick = function() {
        if (isEditing && currentRow) {
            updateRowData(currentRow);
            isEditing = false;
            currentRow = null;
        } else {
            getMaxId(function(maxId) {
                nextId = maxId + 1;
                addNewRow(nextId);
            });
        }

        // Schließt das Popup-Formular nach dem Hinzufügen oder Bearbeiten
        popupForm.style.display = "none";
        document.getElementById("medForm").reset();
        document.getElementById("btm").checked = false;
        document.getElementById("ab").checked = false;
    }

    function addNewRow(uniqueId) {
        const medTable = document.getElementById("medTable").getElementsByTagName('tbody')[0];
        const newRow = medTable.insertRow();
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();

        // Füge die Formulardaten in die neue Zeile ein
        newRow.insertCell(0).textContent = uniqueId; // ID ist nicht veränderbar
        newRow.insertCell(1).textContent = document.getElementById("priority").value;
        newRow.insertCell(2).textContent = document.getElementById("brand").value;
        newRow.insertCell(3).textContent = getIndication(); // Setze die Indikation
        newRow.insertCell(4).textContent = document.getElementById("agent").value;
        newRow.insertCell(5).textContent = document.getElementById("dose").value;
        newRow.insertCell(6).textContent = document.getElementById("form").value;
        newRow.insertCell(7).textContent = getMinStorage();
        newRow.insertCell(8).textContent = document.getElementById("storage").value;
        newRow.insertCell(9).textContent = document.getElementById("open").value;
        newRow.insertCell(10).textContent = checkStorage();
        newRow.insertCell(11).textContent = formattedDate;

        newRow.insertCell(12); // Leere Zelle für "Zuletzt bestellt"

        const actionsCell = newRow.insertCell(13);
        const bearbeitenButton = document.createElement("button");
        bearbeitenButton.textContent = "BE";
        bearbeitenButton.onclick = function() {
            fillFormWithRowData(newRow);
        };
        actionsCell.appendChild(bearbeitenButton);

        const bestellenButton = document.createElement("button");
        bestellenButton.textContent = "Or";
        bestellenButton.onclick = function() {
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString();
            newRow.cells[12].textContent = formattedDate;

            const dataRef = ref(database, 'medications/' + uniqueId);
            update(dataRef, { lastOrdered: formattedDate });
        };
        actionsCell.appendChild(bestellenButton);

        const dataRef = ref(database, 'medications/' + uniqueId);
        set(dataRef, {
            id: uniqueId,
            priority: document.getElementById("priority").value,
            brand: document.getElementById("brand").value,
            indication: getIndication(),
            agent: document.getElementById("agent").value,
            dose: document.getElementById("dose").value,
            form: document.getElementById("form").value,
            minStorage: getMinStorage(),
            storage: document.getElementById("storage").value,
            open: document.getElementById("open").value,
            checkStorage: checkStorage(),
            lastUpdated: formattedDate,
            lastOrdered: ""
        });
    }

    function fillFormWithRowData(row) {
        isEditing = true;
        currentRow = row;

        document.getElementById("priority").value = row.cells[1].textContent;
        document.getElementById("brand").value = row.cells[2].textContent;
        document.getElementById("agent").value = row.cells[4].textContent;
        document.getElementById("dose").value = row.cells[5].textContent;
        document.getElementById("id").value = row.cells[0].textContent; // ID nicht änderbar
        document.getElementById("form").value = row.cells[6].textContent;
        document.getElementById("storage").value = row.cells[8].textContent;
        document.getElementById("open").value = row.cells[9].textContent;

        const btmCheckbox = document.getElementById("btm");
        const abCheckbox = document.getElementById("ab");
        const indication = row.cells[3].textContent;

        if (indication === "BTM") {
            btmCheckbox.checked = true;
            abCheckbox.checked = false;
        } else if (indication === "AB") {
            abCheckbox.checked = true;
            btmCheckbox.checked = false;
        } else {
            btmCheckbox.checked = false;
            abCheckbox.checked = false;
        }

        popupForm.style.display = "flex";
    }

    function updateRowData(row) {
        row.cells[1].textContent = document.getElementById("priority").value;
        row.cells[2].textContent = document.getElementById("brand").value;
        row.cells[3].textContent = getIndication();
        row.cells[4].textContent = document.getElementById("agent").value;
        row.cells[5].textContent = document.getElementById("dose").value;
        row.cells[6].textContent = document.getElementById("form").value;
        row.cells[7].textContent = getMinStorage();
        row.cells[8].textContent = document.getElementById("storage").value;
        row.cells[9].textContent = document.getElementById("open").value;
        row.cells[10].textContent = checkStorage();
        row.cells[11].textContent = new Date().toLocaleDateString();

        const dataRef = ref(database, 'medications/' + row.cells[0].textContent);
        update(dataRef, {
            priority: document.getElementById("priority").value,
            brand: document.getElementById("brand").value,
            indication: getIndication(),
            agent: document.getElementById("agent").value,
            dose: document.getElementById("dose").value,
            form: document.getElementById("form").value,
            minStorage: getMinStorage(),
            storage: document.getElementById("storage").value,
            open: document.getElementById("open").value,
            checkStorage: checkStorage(),
            lastUpdated: new Date().toLocaleDateString()
        });
    }

    function getIndication() {
        if (document.getElementById("btm").checked) {
            return "BTM";
        } else if (document.getElementById("ab").checked) {
            return "AB";
        } else {
            return "Sonstiges";
        }
    }

    function getMinStorage() {
        const prio = document.getElementById("priority").value;
        switch (prio) {
            case "Hoch":
                return "5";
            case "Mittel":
                return "3";
            case "Niedrig":
                return "1";
            case "Sonstiges":
                return "-";
            default:
                return "-";
        }
    }

    function checkStorage() {
        const currentStorage = parseInt(document.getElementById("storage").value, 10);
        const minStorage = getMinStorage();

        if (minStorage === "-") {
            return "Bestand Stimmt!";
        } else {
            if (currentStorage < minStorage) {
                return "Bestellen!";
            } else {
                return "Bestand Stimmt!";
            }
        }
    }

    // Lade Daten beim Start
    function loadData() {
        const medTable = document.getElementById("medTable").getElementsByTagName('tbody')[0];
        const dataRef = ref(database, 'medications');

        onValue(dataRef, (snapshot) => {
            medTable.innerHTML = ""; // Leere die Tabelle
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const newRow = medTable.insertRow();
                newRow.insertCell(0).textContent = data.id;
                newRow.insertCell(1).textContent = data.priority;
                newRow.insertCell(2).textContent = data.brand;
                newRow.insertCell(3).textContent = data.indication;
                newRow.insertCell(4).textContent = data.agent;
                newRow.insertCell(5).textContent = data.dose;
                newRow.insertCell(6).textContent = data.form;
                newRow.insertCell(7).textContent = data.minStorage;
                newRow.insertCell(8).textContent = data.storage;
                newRow.insertCell(9).textContent = data.open;
                newRow.insertCell(10).textContent = data.checkStorage;
                newRow.insertCell(11).textContent = data.lastUpdated;
                newRow.insertCell(12).textContent = data.lastOrdered || "";

                const actionsCell = newRow.insertCell(13);
                const bearbeitenButton = document.createElement("button");
                bearbeitenButton.textContent = "BE";
                bearbeitenButton.onclick = function() {
                    fillFormWithRowData(newRow);
                };
                actionsCell.appendChild(bearbeitenButton);

                const bestellenButton = document.createElement("button");
                bestellenButton.textContent = "Or";
                bestellenButton.onclick = function() {
                    const currentDate = new Date();
                    const formattedDate = currentDate.toLocaleDateString();
                    newRow.cells[12].textContent = formattedDate;

                    const dataRef = ref(database, 'medications/' + data.id);
                    update(dataRef, { lastOrdered: formattedDate });
                };
                actionsCell.appendChild(bestellenButton);
            });
        }, {
            onlyOnce: false
        });
    }

    loadData();
});





