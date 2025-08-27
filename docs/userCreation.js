// public record User(string UserName, string[]? Links, string[]? Descriptions, ulong Id);
import { userNameVerification } from "./userCreationService.js";
const makeForm = () => {
    const userCreationForm = document.getElementById("userForm");
    const formWrapperNode = document.createElement("form");
    formWrapperNode.setAttribute("action", "submit");
    formWrapperNode.setAttribute("id", "newUserForm");
    
    // Add form title
    const formTitle = document.createElement("h2");
    formTitle.className = "text-center mb-4 text-light";
    formTitle.textContent = "Create New Account";
    
    const userNameLabel = document.createElement("label");
    userNameLabel.setAttribute("for", "userName");
    userNameLabel.className = "form-label text-light mb-2";
    userNameLabel.textContent = "Username:";
    
    const userNameInput = document.createElement("input");
    userNameInput.setAttribute("type", "text");
    userNameInput.setAttribute("id", "userName");
    userNameInput.setAttribute("name", "userName");
    userNameInput.className = "form-control mb-3 bg-dark text-light border-secondary";
    userNameInput.setAttribute("placeholder", "Enter your username");
    
    // Create button wrapper for submit and cancel buttons
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = "d-flex gap-2 mb-3";
    
    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.textContent = "Create User";
    submitButton.className = "btn btn-primary flex-fill";
    
    const cancelButton = document.createElement("button");
    cancelButton.setAttribute("type", "button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "btn btn-outline-secondary flex-fill";
    cancelButton.addEventListener("click", () => {
        window.location.href = "loginPrototype.html";
    });
    
    buttonWrapper.append(submitButton, cancelButton);
    
    const statusText = document.createElement("p");
    statusText.setAttribute("id", "statusText");
    statusText.className = "text-center";
    
    const backToLogin = document.createElement("a");
    backToLogin.setAttribute("href", "loginPrototype.html");
    backToLogin.className = "text-light text-decoration-none";
    backToLogin.textContent = "Back to login page";
    formWrapperNode.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Creating...';
        cancelButton.disabled = true;
        
        try {
            const creationMessage = await userNameVerification(userNameInput.value);
            userNameInput.value = "";
            statusText.textContent = creationMessage;
            
            // Add styling based on success/error
            if (creationMessage.includes("successfully")) {
                statusText.className = "text-center text-info";
                // Hide buttons on success and show link to login
                buttonWrapper.style.display = "none";
                if (!formWrapperNode.contains(backToLogin)) {
                    const linkWrapper = document.createElement("div");
                    linkWrapper.className = "text-center mt-3";
                    linkWrapper.append(backToLogin);
                    formWrapperNode.append(linkWrapper);
                }
            } else {
                statusText.className = "text-center text-warning";
            }
        } catch (error) {
            console.error('Error creating user:', error);
            statusText.textContent = "Error creating user. Please try again.";
            statusText.className = "text-center text-danger";
        } finally {
            // Reset loading state (only if not successful)
            if (!statusText.textContent.includes("successfully")) {
                submitButton.disabled = false;
                submitButton.textContent = "Create User";
                cancelButton.disabled = false;
            }
        }
    });
    
    formWrapperNode.append(formTitle, userNameLabel, userNameInput, buttonWrapper, statusText);
    userCreationForm?.append(formWrapperNode);
    userCreationForm?.append(formWrapperNode);
};
makeForm();
//# sourceMappingURL=userCreation.js.map