const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");
const internForm = document.getElementById("internForm");
const message = document.getElementById("message");

menuButton.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

internForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const skill = document.getElementById("skill").value.trim();

  message.textContent = `${name} registered successfully for ${skill}.`;
  internForm.reset();
});
