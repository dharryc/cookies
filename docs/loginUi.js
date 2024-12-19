import { validateUser } from "./loginService.js";
const logInNode = document.getElementById("userLogin");
const errorText = document.getElementById("error");
logInNode?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const username = document.getElementById("username").value.toLowerCase();
    errorText.textContent = "Loading";
    if (await validateUser(username)) {
        window.location.href = `./userListPagePrototype.html?user=${username}`;
    }
    else {
        errorText.textContent = "I couldn't find that user.";
    }
});
//# sourceMappingURL=loginUi.js.map