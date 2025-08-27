import { validateUser } from "./loginService.js";
const logInNode = document.getElementById("userLogin");
const errorText = document.getElementById("error");
const submitButton = logInNode?.querySelector('input[type="submit"]');

logInNode?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const username = document.getElementById("username").value.toLowerCase();
    
    // Store original button state
    const originalValue = submitButton?.value;
    
    // Show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.value = "Logging in...";
        submitButton.style.cursor = "wait";
    }
    errorText.textContent = "";
    
    try {
        if (await validateUser(username)) {
            window.location.href = `./userListPagePrototype.html?user=${username}`;
        }
        else {
            errorText.textContent = "I couldn't find that user.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        errorText.textContent = "An error occurred. Please try again.";
    } finally {
        // Reset button state
        if (submitButton && originalValue) {
            submitButton.disabled = false;
            submitButton.value = originalValue;
            submitButton.style.cursor = "pointer";
        }
    }
});
//# sourceMappingURL=loginUi.js.map