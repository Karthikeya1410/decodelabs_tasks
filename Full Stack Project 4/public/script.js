const internForm = document.getElementById("internForm");
const internList = document.getElementById("internList");
const refreshButton = document.getElementById("refreshButton");
const message = document.getElementById("message");

async function loadInterns() {
  internList.textContent = "Loading...";

  try {
    const response = await fetch("/api/interns");
    const interns = await response.json();

    internList.innerHTML = "";

    interns.forEach(intern => {
      const card = document.createElement("article");
      card.className = "intern-card";
      card.innerHTML = `
        <h3>${intern.name}</h3>
        <p>${intern.email}</p>
        <p><strong>Skill:</strong> ${intern.skill}</p>
      `;
      internList.appendChild(card);
    });
  } catch (error) {
    internList.textContent = "Unable to load interns.";
  }
}

internForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const intern = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    skill: document.getElementById("skill").value
  };

  try {
    const response = await fetch("/api/interns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intern)
    });

    const result = await response.json();

    if (!response.ok) {
      message.textContent = result.error;
      return;
    }

    message.textContent = "Intern added successfully.";
    internForm.reset();
    await loadInterns();
  } catch (error) {
    message.textContent = "Server connection failed.";
  }
});

refreshButton.addEventListener("click", loadInterns);
loadInterns();
