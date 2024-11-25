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

//********************************************** K A R T E N *********************************************************/
document.addEventListener("DOMContentLoaded", function () {
    const popupForm = document.getElementById("popupForm");
    const openFormBtn = document.getElementById("openFormBtn");
    const closeBtn = document.getElementsByClassName("closeBtn")[0];
    const addMedBtn = document.getElementById("addMedBtn");
    const medCards = document.getElementById("medCards");
    const medTable = document.getElementById("medTable").getElementsByTagName('tbody')[0];
    let isEditing = false; // Bearbeitungsmodus prüfen
    let currentRow; // Zeile in Bearbeitung
    let nextId = 1; // Für neue IDs

    //KARTE ANLEGEN________________________________________________///////////////////////
    function createCard(data) {
        const medCards = document.getElementById("medCards");
        const card = document.createElement("div");
        card.classList.add("card", "mb-3");
        card.innerHTML = `
            <div class="card-body d-flex flex-column">
                <!-- Daten im Grid -->
                <div class="d-grid grid-layout">
                    <!-- Linke Spalte -->
                    <div>
                        <p><strong>ID:</strong> ${data.id}</p>
                        <p><strong>Priorität:</strong> <span class="priority">${data.priority}</span></p>
                        <p><strong>Handelsname:</strong> ${data.brand}</p>
                        <p><strong>Indikation:</strong> ${data.indication}</p>
                        <p><strong>Wirkstoff:</strong> ${data.agent}</p>
                        <p><strong>Dosierung:</strong> ${data.dose}</p>
                    </div>
                    <!-- Rechte Spalte -->
                    <div>
                        <p><strong>Darreichungsform:</strong> ${data.form}</p>
                        <p><strong>Prüfung:</strong> <span class="checkStorage">${data.checkStorage}</span></p>
                        <p><strong>Zuletzt aktualisiert:</strong> ${data.lastUpdated}</p>
                        <p><strong>Zuletzt bestellt:</strong> ${data.lastOrdered || 'Nicht verfügbar'}</p>
                        <p><strong>Vorrat:</strong> ${data.storage}</p>
                        <div class="d-flex justify-content-left">
                            <button class="btn btn-primary btn-sm me-2 edit-button" data-id="${data.id}">Bearbeiten</button>
                            <button class="btn btn-success btn-sm order-button" data-id="${data.id}">Bestellen</button>
                        </div>
                    </div>
                </div>
                <!-- Buttons -->
                
            </div>
        `;

        // Event-Listener für die Buttons
        const editButton = card.querySelector(".edit-button");
        const orderButton = card.querySelector(".order-button");

        editButton.addEventListener("click", () => editMedication(data.id));
        orderButton.addEventListener("click", () => orderMedication(data.id));

        // Priorität und Prüfung formatieren
        const priorityElement = card.querySelector(".priority");
        switch (data.priority) {
            case "Hoch":
                priorityElement.style.fontWeight = "bold";
                priorityElement.style.color = "red";
                break;
            case "Mittel":
                priorityElement.style.fontWeight = "bold";
                priorityElement.style.color = "darkorange";
                break;
            case "Niedrig":
                priorityElement.style.fontWeight = "bold";
                priorityElement.style.color = "green";
                break;
            case "Sonstiges":
                priorityElement.style.fontWeight = "bold";
                priorityElement.style.color = "black";
                break;
        }

        const checkStorageElement = card.querySelector(".checkStorage");
        switch (data.checkStorage) {
            case "Bestand Stimmt!":
                checkStorageElement.style.fontWeight = "bold";
                checkStorageElement.style.color = "green";
                break;
            case "Bestellen!":
                checkStorageElement.style.fontWeight = "bold";
                checkStorageElement.style.color = "red";
                break;
            case "Bestellt!":
                checkStorageElement.style.fontWeight = "bold";
                checkStorageElement.style.color = "darkorange";
                break;
        }

        medCards.appendChild(card);
    }
    
    function addNewRow(uniqueId) {
        const currentDate = new Date().toLocaleDateString();

        // Datenstruktur
        const data = {
            id: uniqueId,
            priority: document.getElementById("priority").value,
            brand: document.getElementById("brand").value,
            indication: getIndication(),
            agent: document.getElementById("agent").value,
            dose: document.getElementById("dose").value,
            form: document.getElementById("form").value,
            storage: document.getElementById("storage").value,
            lastUpdated: currentDate,
        };

        // Zeile zur Tabelle hinzufügen
        const newRow = medTable.insertRow();
        newRow.insertCell(0).textContent = data.id;
        newRow.insertCell(1).textContent = data.priority;
        newRow.insertCell(2).textContent = data.brand;
        newRow.insertCell(3).textContent = data.indication;
        newRow.insertCell(4).textContent = data.agent;
        newRow.insertCell(5).textContent = data.dose;
        newRow.insertCell(6).textContent = data.form;
        newRow.insertCell(7).textContent = data.storage;

        // Dynamische Karte erstellen
        createCard(data);
    }

    // Daten bei Start laden
    function loadData() {
        const medTable = document.getElementById("medTable").getElementsByTagName('tbody')[0];
        const medCards = document.getElementById("medCards");
        const dataRef = ref(database, 'medications');
    
        onValue(dataRef, (snapshot) => {
            medTable.innerHTML = ""; // Tabelle leeren
            medCards.innerHTML = ""; // Karten leeren
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
    
                // Zeile zur Tabelle hinzufügen
                const newRow = medTable.insertRow();
                newRow.insertCell(0).textContent = data.id;
                newRow.insertCell(1).textContent = data.priority;
                newRow.insertCell(2).textContent = data.brand;
                newRow.insertCell(3).textContent = data.indication;
                newRow.insertCell(4).textContent = data.agent;
                newRow.insertCell(5).textContent = data.dose;
                newRow.insertCell(6).textContent = data.form;
                newRow.insertCell(7).textContent = data.checkStorage;
                newRow.insertCell(8).textContent = data.lastUpdated;
                newRow.insertCell(9).textContent = data.lastOrdered || "Nicht verfügbar";
    
                // Karte erstellen
                createCard(data);
            });
        });
    }
    
    //Bearbeiten BUTTON und BESTELLEN BUTTON
    document.addEventListener("click", function (event) {
        // Bearbeiten-Button
        if (event.target.classList.contains("edit-button")) {
            const id = event.target.dataset.id;
            editMedication(id);
        }
    
        // Bestellen-Button
        if (event.target.classList.contains("order-button")) {
            const id = event.target.dataset.id;
            orderMedication(id);
        }
    });
    

    function editMedication(id) {
        addMedBtnCard.style.display = "block";
        addMedBtn.style.display ="none";
        isEditing = true;
        console.log("Editing medication with ID:", id);
    
        // Find and save the current row from the table
        const rows = medTable.getElementsByTagName("tr");
        for (let row of rows) {
            if (row.cells[0].textContent == id) {
                currentRow = row;
                break;
            }
        }
    
        const dataRef = ref(database, 'medications/' + id);
        onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            document.getElementById("id").value = data.id;
            document.getElementById("priority").value = data.priority;
            document.getElementById("brand").value = data.brand;
            document.getElementById("agent").value = data.agent;
            document.getElementById("dose").value = data.dose;
            document.getElementById("form").value = data.form;
            document.getElementById("storage").value = data.storage;
            document.getElementById("open").value = data.open;
    
            document.getElementById("popupForm").style.display = "flex"; // Open form
        });
    }
    
       // Doppelklick auf eine Zeile, um das Formular mit den Zeilendaten zu füllen
    medCards.addEventListener('dblclick', function(event) {
        let targetCard = event.target.closest('.card');
        if (targetCard) {
            const id = targetCard.querySelector('.edit-button').dataset.id;
            editMedication(id);
        }
    });

    // UPDATE ROW DATA
    function updateRowData(row) {
        const currentDate = new Date().toLocaleDateString();
        const updatedData = {
            priority: document.getElementById("priority").value,
            brand: document.getElementById("brand").value,
            indication: getIndication(),
            agent: document.getElementById("agent").value,
            dose: document.getElementById("dose").value,
            form: document.getElementById("form").value,
            storage: document.getElementById("storage").value,
            open: document.getElementById("open").value,
            lastUpdated: currentDate,
        };

        // Update database
        const id = row.cells[0].textContent;
        const dataRef = ref(database, 'medications/' + id);
        update(dataRef, {
            ...updatedData,
            checkStorage: checkStorage(),
        });
    
        // Update row in the table
        row.cells[1].textContent = updatedData.priority;
        row.cells[2].textContent = updatedData.brand;
        row.cells[3].textContent = updatedData.indication;
        row.cells[4].textContent = updatedData.agent;
        row.cells[5].textContent = updatedData.dose;
        row.cells[6].textContent = updatedData.form;
        row.cells[7].textContent = updatedData.storage;
    
        // Update card
        createCard({ id, ...updatedData });
    }
    
    function getIndication() {
        if (document.getElementById("btm").checked) {
            return "BTM";
        } else if (document.getElementById("ab").checked) {
            return "AB";
        } else {
            return "";
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

    addMedBtnCard.onclick = function () {
        // Überprüfen, ob alle Felder ausgefüllt sind
        const requiredFields = ["priority", "brand", "agent", "dose", "form", "storage", "open"];
        let allFieldsFilled = true;

        requiredFields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement.value.trim() === "") {
                allFieldsFilled = false;
                inputElement.style.border = "2px solid red"; // Rot umrandet, wenn nicht ausgefüllt
            } else {
                inputElement.style.border = ""; // Entfernt die Umrandung, wenn ausgefüllt
            }
        });

        if (!allFieldsFilled) {
            alert("Bitte vervollständigen Sie Ihre Angaben");
            return;
        }

            updateRowData(currentRow); // Bearbeitungsmodus: Zeile aktualisieren
        // Schließt das Popup-Formular nach dem Hinzufügen oder Bearbeiten
        popupForm.style.display = "none";
        document.getElementById("medFormular").reset();
        document.getElementById("btm").checked = false;
        document.getElementById("ab").checked = false;
    };
    
    function orderMedication(id) {
        console.log("Bestellen für ID:", id);
        const currentDate = new Date().toLocaleDateString();
        const dataRef = ref(database, `medications/${id}`);
        update(dataRef, { lastOrdered: currentDate });
    }
    
    loadData(); // Daten nach Aktualisierung neu laden
});






//********************************************** T A B E L L E *********************************************************/

document.addEventListener("DOMContentLoaded", function() {
    const popupForm = document.getElementById("popupForm");
    const openFormBtn = document.getElementById("openFormBtn");
    const closeBtn = document.getElementsByClassName("closeBtn")[0];
    const closeBtnScanner = document.getElementById("closeBtnScanner")
    const addMedBtn = document.getElementById("addMedBtn");
    const medCards = document.getElementById("medCards");
    const medTable = document.getElementById("medTable").getElementsByTagName('tbody')[0];
    let isEditing = false; // Zustand, um zu überprüfen, ob wir im Bearbeitungsmodus sind
    let currentRow; // Zeile, die bearbeitet wird
    let nextId = 1; // Zähler für die eindeutige ID


/************************************************     B A R C O D E S C A N N E R ****************************************** */
  // Funktion zur Verarbeitung des gescannten Barcodes
function processScannedBarcode(barcode) {
    const dataRef = ref(database, 'medications');

    onValue(dataRef, (snapshot) => {
        let found = false;

        // Durchlaufe alle Medikamente in der Datenbank
        snapshot.forEach((childSnapshot) => {
            const medication = childSnapshot.val();

            // Prüfen, ob der Barcode in der Barcode-Liste enthalten ist
            if (medication.barcodes && medication.barcodes.includes(barcode)) {
                found = true;

                // Bestand erhöhen
                const updatedStorage = parseInt(medication.storage, 10) + 1;

                // Aktualisierung in Firebase
                const medicationRef = ref(database, `medications/${medication.id}`);
                update(medicationRef, {
                    storage: updatedStorage,
                    lastUpdated: new Date().toLocaleDateString(),
                });

                // Erfolgsmeldung anzeigen
                alert(`Bestand von ${medication.brand} wurde aktualisiert. Neuer Bestand: ${updatedStorage}`);
                loadData(); // Tabelle und Karten aktualisieren
            }
        });

        if (!found) {
            // Wenn Barcode nicht gefunden wurde
            alert("Medikament nicht gefunden. Bitte neues Medikament hinzufügen.");
            openFormBtn.click(); // Öffnet das Formular
            document.getElementById("barcodeInput").value = barcode; // Barcode vorausfüllen
            Quagga.stop();
        }
        
    }, { onlyOnce: true });
    
}

document.getElementById("startScannerBtn").addEventListener("click", function () {
    const scannerForm = document.getElementById("scanner-container");
    scannerForm.style.display = "block";
    startScanner(); // Wird beim Klick aufgerufen
});

 // Barcode-Scanner initialisieren
    function startScanner() {
    const scannerElement = document.getElementById("scanner");
    if (!scannerElement) {
        console.error("Scanner element not found");
        alert("Scanner element not found");
        return;
    }

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: scannerElement, // Kamera-Container
            constraints: {
                facingMode: { ideal: "environment" }, // Rückkamera bevorzugen
            width: { min: 320, ideal: 320, max: 320 }, // Standardauflösung
            height: { min: 240, ideal: 240, max: 240 }
            }
            
        },
        decoder: {
            readers: ["ean_reader"] // EAN-13 für Medikamenten-Barcodes
        }

    }, function (err) {
        if (err) {
            console.error(err);
            alert("Fehler beim Starten des Scanners.");
            return;
        }
        Quagga.start();
    });
}

    // Event-Listener für Barcode-Scanner (Kamera-Unterstützung)
    Quagga.onDetected(function (result) {
        if (result && result.codeResult && result.codeResult.code) {
            const barcode = result.codeResult.code; // Erkannten Barcode erfassen
            document.getElementById("barcodeResult").innerText = `Barcode erkannt: ${barcode}`;

            // Aufruf der bestehenden Funktion zur Verarbeitung
            processScannedBarcode(barcode);

            // Scanner stoppen nach erfolgreicher Erkennung
            Quagga.stop();
        }
    });

    // Event-Listener für Barcode-Scanner (Enter-Taste)
    document.addEventListener('keydown', (event) => {
        const inputField = document.getElementById('barcodeInput');
        if (event.key === 'Enter' && inputField.value) {
            const scannedBarcode = inputField.value.trim();
            processScannedBarcode(scannedBarcode);
            inputField.value = ""; // Eingabefeld leeren
        }
    });

    // Barcode Scanner Schließen
    closeBtnScanner.onclick = function() {
        const scannerForm = document.getElementById("scanner-container");
        scannerForm.style.display = "none";
        Quagga.stop();
        const tracks = Quagga.CameraAccess.getActiveStream().getTracks(); // Aktive Tracks abrufen
        tracks.forEach(track => track.stop());
    }

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
    addMedBtnCard.style.display = "none";
        addMedBtn.style.display ="block";
        addMedBtn.innerText = addMedBtn.getAttribute('data-text-normal');
    popupForm.style.display = "flex";
     isEditing = false; // Setze den Modus auf Hinzufügen
        document.getElementById("id").value = ""; // ID bei Hinzufügen zurücksetzen
    }

// Schließt das Popup-Formular
    closeBtn.onclick = function() {
        
        popupForm.style.display = "none";
        document.getElementById("medFormular").reset();
        document.getElementById("btm").checked = false;
        document.getElementById("ab").checked = false;
    }

    // Schließt das Popup-Formular, wenn außerhalb geklickt wird
    window.onclick = function(event) {
        if (event.target == popupForm) {
            popupForm.style.display = "none";
            document.getElementById("medFormular").reset();
            document.getElementById("btm").checked = false;
            document.getElementById("ab").checked = false;
        }
    }

    // Fügt eine neue Zeile zur Tabelle hinzu, wenn das Formular gesendet wird
    addMedBtn.onclick = function() {
        // Überprüfen, ob alle Felder ausgefüllt sind
        const requiredFields = ["priority", "brand", "agent", "dose", "form", "storage", "open"];
        let allFieldsFilled = true;

        requiredFields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement.value.trim() === "") {
                allFieldsFilled = false;
                inputElement.style.border = "2px solid red"; // Rot umrandet, wenn nicht ausgefüllt
            } else {
                inputElement.style.border = ""; // Entfernt die Umrandung, wenn ausgefüllt
            }
        });

        if (!allFieldsFilled) {
            alert("Bitte vervollständigen Sie Ihre Angaben");
            return;
        }

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
        document.getElementById("medFormular").reset();
        document.getElementById("btm").checked = false;
        document.getElementById("ab").checked = false;
    }

    // Doppelklick auf eine Zeile, um das Formular mit den Zeilendaten zu füllen
    medTable.addEventListener('dblclick', function(event) {
        let targetRow = event.target.closest('tr');
        if (targetRow) {
            fillFormWithRowData(targetRow);
        }
    });

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

        // ----- BEARBEITEN BUTTON
        const bearbeitenButton = document.createElement("button");
        bearbeitenButton.textContent = "BE";
        bearbeitenButton.onclick = function() {
            fillFormWithRowData(newRow);
        };
        
        actionsCell.appendChild(bearbeitenButton);


        // ------ BESTELLEN BUTTON
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


        // Daten in DATENBANK ÜBERTRAGEN
        const dataRef = ref(database, 'medications/' + uniqueId);
        set(dataRef, {
            id: uniqueId,
            barcode:document.getElementById("barcodeInput").value,
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
        addMedBtnCard.style.display = "none";
        addMedBtn.style.display ="block";
        addMedBtn.innerText = addMedBtn.getAttribute('data-text-large');

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
            barcode: [document.getElementById("barcodeInput").value],
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
            return "";
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

                // Barcodes (falls benötigt) laden, aber nicht anzeigen
                const barcodes = data.barcodes || []; // Lade Barcodes als Array

                const priorityCell = newRow.insertCell(1);
                priorityCell.textContent = data.priority;
                switch (data.priority) {
                    case "Hoch":
                        priorityCell.style.fontWeight = "bold";
                        priorityCell.style.color = "red";
                        break;
                    case "Mittel":
                        priorityCell.style.fontWeight = "bold";
                        priorityCell.style.color = "darkorange";
                        break;
                    case "Niedrig":
                        priorityCell.style.fontWeight = "bold";
                        priorityCell.style.color = "green";
                        break;
                    case "Sonstiges":
                        priorityCell.style.fontWeight = "bold";
                        priorityCell.style.color = "black";
                        break;
                }

                newRow.insertCell(2).textContent = data.brand;
                newRow.insertCell(3).textContent = data.indication;
                newRow.insertCell(4).textContent = data.agent;
                newRow.insertCell(5).textContent = data.dose;
                newRow.insertCell(6).textContent = data.form;
                newRow.insertCell(7).textContent = data.minStorage;
                newRow.insertCell(8).textContent = data.storage;
                newRow.insertCell(9).textContent = data.open;

                const checkStorageCell = newRow.insertCell(10);
                checkStorageCell.textContent = data.checkStorage;
                switch (data.checkStorage) {
                    case "Bestand Stimmt!":
                        checkStorageCell.style.fontWeight = "bold";
                        checkStorageCell.style.color = "green";
                        break;
                    case "Bestellen!":
                        checkStorageCell.style.fontWeight = "bold";
                        checkStorageCell.style.color = "red";
                        break;
                    case "Bestellt!":
                        checkStorageCell.style.fontWeight = "bold";
                        checkStorageCell.style.color = "darkorange";
                        break;
                }

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

// Sortierfunktion
function sortTable(columnIndex, ascending) {
    const table = document.getElementById("medTable");
    const tbody = table.getElementsByTagName("tbody")[0];
    const rows = Array.from(tbody.getElementsByTagName("tr"));

    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();

        if (!isNaN(aText) && !isNaN(bText)) {
            return ascending ? aText - bText : bText - aText;
        }

        return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    rows.forEach(row => tbody.appendChild(row));
}

// Event-Listener für Tabellenköpfe
document.querySelectorAll("#medTable th").forEach((th, index) => {
    let ascending = true;
    th.addEventListener("click", () => {
        // Entfernt vorherige Dreiecke
        document.querySelectorAll("#medTable th").forEach(header => {
            header.textContent = header.textContent.replace(" ▲", "").replace(" ▼", "");
        });

        // Tabelle sortieren
        sortTable(index, ascending);

        // Aktuelles Dreieck hinzufügen
        th.textContent += ascending ? " ▲" : " ▼";
        ascending = !ascending;
    });
});

document.getElementById('medSearchInput').addEventListener('input', function() {
    let filter = this.value.toLowerCase();
    let tableRows = document.querySelectorAll('#medTable tbody tr');
    let cards = document.querySelectorAll('#medCards .card');

    tableRows.forEach(row => {
        let text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });

    cards.forEach(card => {
        let text = card.textContent.toLowerCase();
        card.style.display = text.includes(filter) ? '' : 'none';
    });
});








