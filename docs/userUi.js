import { currentUser, addNewItem, getUserItems, deleteItem, addDate, addMoreDescription, } from "./userService.js";
const userNameInUrl = new URLSearchParams(window.location.search);
const activeUserName = userNameInUrl.get("user");
const CardMaker = (link, description, id, moreDetails) => {
    const cardContainer = document.getElementById("cardContainer") || document.getElementById("pageContent");
    
    // Create a column wrapper for responsive grid
    const colWrapper = document.createElement("div");
    colWrapper.className = "col-12 col-md-6 col-lg-4 mb-3";
    
    const cardWrapperNode = document.createElement("div");
    cardWrapperNode.setAttribute("id", id.toString());
    cardWrapperNode.className = "card h-100 bg-dark border-secondary text-light shadow-sm";
    
    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column";
    
    const linkNode = document.createElement("a");
    linkNode.setAttribute("target", "_blank");
    linkNode.textContent = description;
    linkNode.setAttribute("href", link);
    linkNode.className = "card-title h6 text-decoration-none text-light mb-3";
    
    const descriptionNode = document.createElement("p");
    descriptionNode.className = "card-text text-light mb-3 flex-grow-1";
    descriptionNode.textContent = moreDetails || "";
    
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger btn-sm me-2";
    deleteButton.textContent = "Delete Item";
    deleteButton.addEventListener("click", async () => {
        // Show confirmation dialog
        const confirmDelete = confirm(`Are you sure you want to delete "${description}"?\n\nThis action cannot be undone.`);
        
        if (!confirmDelete) {
            return; // User cancelled, do nothing
        }
        
        // Show loading state
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Deleting...';
        
        try {
            await deleteItem(activeUserName, id);
            await cardGenerator();
            cardContainer?.removeChild(colWrapper);
        } catch (error) {
            console.error('Error deleting item:', error);
            // Show error state
            deleteButton.innerHTML = 'Error - Try Again';
            setTimeout(() => {
                deleteButton.innerHTML = 'Delete Item';
                deleteButton.disabled = false;
            }, 3000);
        }
    });

    const longerDescriptionButton = document.createElement("button");
    longerDescriptionButton.className = "btn btn-secondary btn-sm";
    
    // Set button text based on whether description exists
    if (moreDetails && moreDetails.trim() !== "") {
        longerDescriptionButton.textContent = "Edit description";
    } else {
        longerDescriptionButton.textContent = "Add description";
    }

    longerDescriptionButton.addEventListener("click", () => {
        const descriptionBox = document.createElement("textarea");
        descriptionBox.className = "form-control bg-dark text-light border-secondary mb-3";
        descriptionBox.value = moreDetails || "";
        descriptionBox.rows = 3;
        
        const descriptionSubmissionButton = document.createElement("button");
        descriptionSubmissionButton.className = "btn btn-primary btn-sm";
        descriptionSubmissionButton.textContent = "Confirm description";
        
        const descriptionCancelButton = document.createElement("button");
        descriptionCancelButton.className = "btn btn-outline-secondary btn-sm";
        descriptionCancelButton.textContent = "Cancel";
        
        const descriptionButtonWrapper = document.createElement("div");
        descriptionButtonWrapper.className = "d-flex gap-2 mb-3";
        descriptionButtonWrapper.append(descriptionSubmissionButton, descriptionCancelButton);
        
        // Insert the description editing elements before the footer
        cardBody.insertBefore(descriptionBox, cardBody.lastElementChild);
        cardBody.insertBefore(descriptionButtonWrapper, cardBody.lastElementChild);

        descriptionCancelButton.addEventListener("click", () => {
            cardBody.removeChild(descriptionBox);
            cardBody.removeChild(descriptionButtonWrapper);
        });

        descriptionSubmissionButton.addEventListener("click", async () => {
            // Show loading state
            descriptionSubmissionButton.disabled = true;
            descriptionSubmissionButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
            descriptionCancelButton.disabled = true;

            try {
                await addMoreDescription(activeUserName, id, descriptionBox.value);
                
                // Update the stored description and display it in the card
                moreDetails = descriptionBox.value;
                descriptionNode.textContent = moreDetails;
                
                // Update button text based on new description
                if (moreDetails && moreDetails.trim() !== "") {
                    longerDescriptionButton.textContent = "Edit description";
                } else {
                    longerDescriptionButton.textContent = "Add description";
                }

                // Clean up the editing interface
                cardBody.removeChild(descriptionBox);
                cardBody.removeChild(descriptionButtonWrapper);
            } catch (error) {
                console.error('Error updating description:', error);
                // Show error state
                descriptionSubmissionButton.innerHTML = 'Error - Try Again';
                descriptionSubmissionButton.className = "btn btn-danger btn-sm";
                setTimeout(() => {
                    descriptionSubmissionButton.innerHTML = 'Confirm description';
                    descriptionSubmissionButton.className = "btn btn-primary btn-sm";
                    descriptionSubmissionButton.disabled = false;
                    descriptionCancelButton.disabled = false;
                }, 3000);
            }
        });
    });
    
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = "d-flex gap-2 mt-2";
    buttonWrapper.append(deleteButton, longerDescriptionButton);
    
    // Add button wrapper to card footer for better spacing
    const cardFooter = document.createElement("div");
    cardFooter.className = "mt-auto pt-2";
    cardFooter.append(buttonWrapper);
    
    cardBody.append(linkNode, descriptionNode, cardFooter);
    cardWrapperNode.append(cardBody);
    colWrapper.append(cardWrapperNode);
    cardContainer?.append(colWrapper);
};

const formMaker = () => {
    const formNode = document.getElementById("form");
    
    // Create "Add New Item" button
    const addItemButton = document.createElement("button");
    addItemButton.className = "btn btn-primary mb-3";
    addItemButton.textContent = "Add New Item";
    
    addItemButton.addEventListener("click", () => {
        // Hide the add button and show the form card
        addItemButton.style.display = "none";
        newItemCardWrapper.style.display = "block";
    });
    
    // Create a column wrapper for the new item card to match grid layout
    const newItemCardWrapper = document.createElement("div");
    newItemCardWrapper.className = "col-12 col-md-6 col-lg-4 mb-3";
    newItemCardWrapper.style.display = "none"; // Initially hidden
    
    // Create the new item form card
    const newItemCard = document.createElement("div");
    newItemCard.className = "card h-100 bg-dark border-secondary text-light";
    
    const cardBody = document.createElement("div");
    cardBody.className = "card-body py-3";
    
    const cardTitle = document.createElement("h6");
    cardTitle.className = "card-title mb-3";
    cardTitle.textContent = "Add New Item";
    
    const inputParentNode = document.createElement("form");
    inputParentNode.setAttribute("action", "submit");
    inputParentNode.setAttribute("id", "itemForm");
    
    const titleLabel = document.createElement("label");
    titleLabel.setAttribute("for", "title");
    titleLabel.className = "form-label small mb-1";
    titleLabel.textContent = "Item description:";
    
    const itemTitleNode = document.createElement("input");
    itemTitleNode.setAttribute("type", "text");
    itemTitleNode.setAttribute("id", "title");
    itemTitleNode.setAttribute("name", "title");
    itemTitleNode.className = "form-control form-control-sm mb-2 bg-dark text-light border-secondary";
    itemTitleNode.setAttribute("placeholder", "Enter description...");
    
    const linkLabel = document.createElement("label");
    linkLabel.setAttribute("for", "link");
    linkLabel.className = "form-label small mb-1";
    linkLabel.textContent = "Item link:";
    
    const itemLinkNode = document.createElement("input");
    itemLinkNode.setAttribute("type", "text");
    itemLinkNode.setAttribute("id", "link");
    itemLinkNode.setAttribute("name", "link");
    itemLinkNode.className = "form-control form-control-sm mb-3 bg-dark text-light border-secondary";
    itemLinkNode.setAttribute("placeholder", "Enter link...");
    
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = "d-flex gap-2";
    
    const saveButton = document.createElement("button");
    saveButton.className = "btn btn-primary btn-sm flex-fill";
    saveButton.textContent = "Save";
    saveButton.setAttribute("type", "submit");
    
    const cancelButton = document.createElement("button");
    cancelButton.className = "btn btn-outline-secondary btn-sm flex-fill";
    cancelButton.textContent = "Cancel";
    cancelButton.setAttribute("type", "button");
    
    cancelButton.addEventListener("click", () => {
        // Clear form and hide card
        itemTitleNode.value = "";
        itemLinkNode.value = "";
        newItemCardWrapper.style.display = "none";
        addItemButton.style.display = "block";
    });
    
    inputParentNode.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        if (itemTitleNode.value.trim() && itemLinkNode.value.trim()) {
            // Show loading state
            saveButton.disabled = true;
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
            cancelButton.disabled = true;
            
            try {
                const id = Date.now();
                await addNewItem(itemLinkNode.value, itemTitleNode.value, activeUserName, id);
                CardMaker(itemLinkNode.value, itemTitleNode.value, id, "");
                
                // Clear form and hide card
                itemTitleNode.value = "";
                itemLinkNode.value = "";
                newItemCardWrapper.style.display = "none";
                addItemButton.style.display = "block";
            } catch (error) {
                console.error('Error adding item:', error);
                // Show error state
                saveButton.innerHTML = 'Error - Try Again';
                saveButton.className = "btn btn-danger btn-sm flex-fill";
                setTimeout(() => {
                    saveButton.innerHTML = 'Save';
                    saveButton.className = "btn btn-primary btn-sm flex-fill";
                }, 3000);
            } finally {
                // Reset loading state
                saveButton.disabled = false;
                saveButton.innerHTML = 'Save';
                cancelButton.disabled = false;
            }
        }
    });
    
    buttonWrapper.append(saveButton, cancelButton);
    inputParentNode.append(titleLabel, itemTitleNode, linkLabel, itemLinkNode, buttonWrapper);
    cardBody.append(cardTitle, inputParentNode);
    newItemCard.append(cardBody);
    newItemCardWrapper.append(newItemCard);
    
    formNode?.append(addItemButton, newItemCardWrapper);
};
const countDownAdder = async (user) => {
    // Don't show birthday form if user already has a birthday set
    if (user.birthDay) {
        return;
    }
    
    const formNode = document.getElementById("form");
    
    // Create "Set Birthday" button
    const setBirthdayButton = document.createElement("button");
    setBirthdayButton.className = "btn btn-info mb-3 me-2";
    setBirthdayButton.textContent = "Set Birthday";
    
    setBirthdayButton.addEventListener("click", () => {
        // Hide the button and show the form card
        setBirthdayButton.style.display = "none";
        birthdayCard.style.display = "block";
    });
    
    // Create the birthday form card
    const birthdayCard = document.createElement("div");
    birthdayCard.className = "card mb-4 bg-dark border-secondary text-light";
    birthdayCard.style.display = "none"; // Initially hidden
    
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    
    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = "Set Birthday";
    
    const countDownForm = document.createElement("form");
    countDownForm.setAttribute("action", "submit");
    countDownForm.setAttribute("id", "dateForm");
    
    const dayLabel = document.createElement("label");
    dayLabel.setAttribute("for", "eventDate");
    dayLabel.className = "form-label";
    dayLabel.textContent = "Set birthday: ";
    
    const dayPicker = document.createElement("input");
    dayPicker.setAttribute("type", "date");
    dayPicker.setAttribute("id", "eventDate");
    dayPicker.setAttribute("name", "eventDate");
    dayPicker.className = "form-control mb-3 bg-dark text-light border-secondary";
    
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = "d-flex gap-2";
    
    const submitButton = document.createElement("button");
    submitButton.className = "btn btn-primary";
    submitButton.textContent = "Confirm date";
    submitButton.setAttribute("type", "submit");
    
    const cancelButton = document.createElement("button");
    cancelButton.className = "btn btn-secondary";
    cancelButton.textContent = "Cancel";
    cancelButton.setAttribute("type", "button");
    
    const confirmationParagraph = document.createElement("p");
    confirmationParagraph.className = "text-info mt-2";
    
    cancelButton.addEventListener("click", () => {
        // Clear form and hide card
        dayPicker.value = "";
        birthdayCard.style.display = "none";
        setBirthdayButton.style.display = "block";
        confirmationParagraph.textContent = "";
    });
    
    countDownForm.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        if (dayPicker.value) {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Setting...';
            cancelButton.disabled = true;
            
            try {
                await addDate(activeUserName, dayPicker.valueAsNumber);
                confirmationParagraph.textContent = "Birthday added!";
                
                // Hide the form after a delay
                setTimeout(() => {
                    birthdayCard.style.display = "none";
                    setBirthdayButton.remove(); // Remove button completely since birthday is now set
                }, 2000);
            } catch (error) {
                console.error('Error setting birthday:', error);
                // Show error state
                submitButton.innerHTML = 'Error - Try Again';
                submitButton.className = "btn btn-danger";
                setTimeout(() => {
                    submitButton.innerHTML = 'Confirm date';
                    submitButton.className = "btn btn-primary";
                    submitButton.disabled = false;
                    cancelButton.disabled = false;
                }, 3000);
            }
        }
    });
    
    buttonWrapper.append(submitButton, cancelButton);
    countDownForm.append(dayLabel, dayPicker, buttonWrapper, confirmationParagraph);
    cardBody.append(cardTitle, countDownForm);
    birthdayCard.append(cardBody);
    
    formNode?.prepend(setBirthdayButton, birthdayCard); // Use prepend to add to top
};
const initializePage = async () => {
    const activeUser = await currentUser(activeUserName);
    
    // Initialize birthday functionality first (at top)
    await countDownAdder(activeUser);
    
    // Then initialize the item form
    formMaker();
    
    // Finally generate the cards
    await cardGenerator();
};

const cardGenerator = async () => {
    const pageContent = document.getElementById("pageContent");
    pageContent?.replaceChildren();
    
    // Create responsive grid container for cards
    const cardContainer = document.createElement("div");
    cardContainer.className = "row g-3";
    cardContainer.id = "cardContainer";
    
    const activeUser = (await currentUser(activeUserName));
    activeUser.items = await getUserItems(activeUserName);
    activeUser.items?.forEach((item) => {
        CardMaker(item.value.link, item.value.description, item.key, item.value.moreDetails);
    });
    
    // Add the grid container to the page
    pageContent?.append(cardContainer);
};
const familyList = document.getElementById("familyList");
familyList?.setAttribute("href", `./familyListPagePrototype.html?user=${activeUserName}`);
const userList = document.getElementById("userList");
userList?.setAttribute("href", `./userListPagePrototype.html?user=${activeUserName}`);
initializePage();
console.log(`http://dharryc.github.io/cookies/shareList.html?user=${activeUserName}`);
//# sourceMappingURL=userUi.js.map