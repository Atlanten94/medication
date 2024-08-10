
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
  import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";

  // Your web app's Firebase configuration
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

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const analytics = getAnalytics(app);

  document.addEventListener("DOMContentLoaded", function() {
      const popupForm = document.getElementById("popupForm");
      const openFormBtn = document.getElementById("openFormBtn");
      const closeBtn = document.getElementsByClassName("closeBtn")[0];
      const addMedBtn = document.getElementById("addMedBtn");
      let isEditing = false; // Zustand, um zu überprüfen, ob wir im Bearbeitungsmodus sind
      let currentRow; // Zeile, die bearbeitet wird
      let nextId = 1; // Zähler für die eindeutige ID

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
              // Wenn wir im Bearbeitungsmodus sind, aktualisiere die Zeile
              updateRowData(currentRow);
              isEditing = false;
              currentRow = null;
          } else {
              // Wenn wir im Hinzufügungsmodus sind, füge eine neue Zeile hinzu
              addNewRow();
          }
          
          // Schließt das Popup-Formular nach dem Hinzufügen oder Bearbeiten
          popupForm.style.display = "none";
          
          // Optional: Leert das Formular nach dem Hinzufügen oder Bearbeiten
          document.getElementById("medForm").reset();
          document.getElementById("btm").checked = false;
          document.getElementById("ab").checked = false;
      }

      function addNewRow() {
          const medTable = document.getElementById("medTable").getElementsByTagName('tbody')[0];
          const newRow = medTable.insertRow();
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleDateString(); // oder .toISOString() für ISO-Format

          // Generiere eine eindeutige ID
          const uniqueId = nextId++;
          
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
          newRow.insertCell(11).textContent = formattedDate; // Zuletzt aktualisiert

          // Füge eine leere Zelle für die "Zuletzt bestellt"-Spalte hinzu
          newRow.insertCell(12);

          // Aktionszelle mit Bearbeiten und Bestellen Buttons
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
              newRow.cells[12].textContent = formattedDate; // Aktualisiere das "Zuletzt bestellt"-Datum
              
              // Aktualisiere das "Zuletzt bestellt"-Datum in Firebase
              const dataRef = ref(database, 'medications/' + uniqueId);
              update(dataRef, { lastOrdered: formattedDate });
          };
          actionsCell.appendChild(bestellenButton);

          // Speichere die neuen Daten in Firebase
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
              lastOrdered: "" // Initially empty, will be updated when "Bestellen" is clicked
          });
      }

      function fillFormWithRowData(row) {
          // Setze den Bearbeitungsmodus und speichere die aktuelle Zeile
          isEditing = true;
          currentRow = row;

          // Fülle das Formular mit den Daten der ausgewählten Zeile
          document.getElementById("priority").value = row.cells[1].textContent;
          document.getElementById("brand").value = row.cells[2].textContent;
          document.getElementById("agent").value = row.cells[4].textContent;
          document.getElementById("dose").value = row.cells[5].textContent;
          document.getElementById("id").value = row.cells[0].textContent; // ID nicht änderbar
          document.getElementById("form").value = row.cells[6].textContent;
          document.getElementById("storage").value = row.cells[8].textContent;
          document.getElementById("open").value = row.cells[9].textContent;

          // Checkboxen
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

          // Öffne das Formular
          popupForm.style.display = "flex";
      }

      function updateRowData(row) {
          // Aktualisiere die Daten der bestehenden Zeile
          row.cells[0].textContent = document.getElementById("id").value; // ID bleibt gleich
          row.cells[1].textContent = document.getElementById("priority").value;
          row.cells[2].textContent = document.getElementById("brand").value;
          row.cells[3].textContent = getIndication(); // Setze die Indikation
          row.cells[4].textContent = document.getElementById("agent").value;
          row.cells[5].textContent = document.getElementById("dose").value;
          row.cells[6].textContent = document.getElementById("form").value;
          row.cells[7].textContent = getMinStorage();
          row.cells[8].textContent = document.getElementById("storage").value;
          row.cells[9].textContent = document.getElementById("open").value;
          row.cells[10].textContent = checkStorage();
          row.cells[11].textContent = new Date().toLocaleDateString(); // Aktuelles Datum

          // Aktualisiere die Daten in Firebase
          const dataRef = ref(database, 'medications/' + document.getElementById("id").value);
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
              lastUpdated: new Date().toLocaleDateString() // Aktualisiere das Datum
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
          // Hole den aktuellen Vorratswert und konvertiere ihn in eine Zahl
          const currentStorage = parseInt(document.getElementById("storage").value, 10);
      
          // Hole den Mindestbestand aus der Funktion getMinStorage
          const minStorage = getMinStorage();
      
          // Vergleiche den aktuellen Vorratswert mit dem Mindestbestand
          if (minStorage === "-") {
              console.log("Der Mindestbestand ist nicht definiert.");
              return "Bestand Stimmt!";
          } else {
              if (currentStorage < minStorage) {
                  console.log("Der Vorrat ist kleiner als der Mindestbestand.");
                  return "Bestellen!";
              } else if (currentStorage > minStorage) {
                  console.log("Der Vorrat ist größer als der Mindestbestand.");
                  return "Bestand Stimmt!";
              } else {
                  console.log("Der Vorrat entspricht dem Mindestbestand.");
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
                  newRow.insertCell(12).textContent = data.lastOrdered || ""; // Zeige leeren Wert an, wenn noch nicht bestellt
                  
                  // Aktionszelle mit Bearbeiten und Bestellen Buttons
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
                      newRow.cells[12].textContent = formattedDate; // Aktualisiere das "Zuletzt bestellt"-Datum
                      
                      // Aktualisiere das "Zuletzt bestellt"-Datum in Firebase
                      const dataRef = ref(database, 'medications/' + data.id);
                      update(dataRef, { lastOrdered: formattedDate });
                  };
                  actionsCell.appendChild(bestellenButton);
              });
          });
      }

      // Initialisiere die Seite mit geladenen Daten
      loadData();
  });


