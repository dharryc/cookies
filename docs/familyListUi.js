import { togglePurchase, allUsers, getFamily } from "./familyListService.js";
import { deleteItem } from "./userService.js";

// Auto-cleanup function to delete purchased items past birthday cleanup period
const autoDeletePurchasedItems = async (user) => {
    if (!user.birthDay || !user.items) return;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Parse the user's birthday (assuming format like "2024-03-15" or similar)
    const userBirthday = new Date(user.birthDay);
    
    // Calculate this year's birthday and last year's birthday
    const thisYearBirthday = new Date(currentYear, userBirthday.getMonth(), userBirthday.getDate());
    const lastYearBirthday = new Date(currentYear - 1, userBirthday.getMonth(), userBirthday.getDate());
    
    // Determine which birthday to use as reference (the most recent one that has passed)
    let referenceBirthday = thisYearBirthday;
    if (today < thisYearBirthday) {
        referenceBirthday = lastYearBirthday;
    }
    
    // Calculate date ranges
    const oneDayAfterBirthday = new Date(referenceBirthday);
    oneDayAfterBirthday.setDate(referenceBirthday.getDate() + 1);
    
    const sixMonthsAfterBirthday = new Date(referenceBirthday);
    sixMonthsAfterBirthday.setMonth(referenceBirthday.getMonth() + 6);
    
    // Check if we're in the auto-delete window (1 day to 6 months after birthday)
    const isInDeleteWindow = today >= oneDayAfterBirthday && today <= sixMonthsAfterBirthday;
    
    if (isInDeleteWindow) {
        // Find purchased items to delete
        const itemsToDelete = user.items.filter(item => 
            item.value.purchased && item.value.purchasedBy
        );
        
        // Delete each qualifying item
        let deletedCount = 0;
        for (const item of itemsToDelete) {
            try {
                await deleteItem(user.userName, item.key);
                deletedCount++;
                console.log(`Auto-deleted purchased item for ${user.userName}: ${item.value.description}`);
            } catch (error) {
                console.error(`Failed to auto-delete item ${item.key} for ${user.userName}:`, error);
            }
        }
        
        return deletedCount;
    }
    
    return 0;
};

const unprocessedFam = await allUsers();
const myFam = await getFamily(unprocessedFam);

// Run auto-cleanup for all family members
let totalDeletedItems = 0;
for (const user of myFam) {
    const deletedCount = await autoDeletePurchasedItems(user);
    totalDeletedItems += deletedCount;
}

// If items were deleted, reload the page to show updated list
if (totalDeletedItems > 0) {
    console.log(`Auto-deleted ${totalDeletedItems} total purchased items past birthday cleanup period`);
    window.location.reload();
}
const userNameInUrl = new URLSearchParams(window.location.search);
const activeUserName = userNameInUrl.get("user");
const parentNode = document.getElementById("pageContent");
const contentNode = document.createElement("div");
const existingCountDown = (birthdayTimestamp) => {
    const dateWrapperNode = document.createElement("h4");
    
    const calculateNextBirthday = () => {
        const originalBirthday = new Date(birthdayTimestamp);
        const now = new Date();
        
        // Get the month and day from the original birthday
        const birthdayMonth = originalBirthday.getMonth();
        const birthdayDay = originalBirthday.getDate();
        
        // Create birthday for this year
        const thisYearBirthday = new Date(now.getFullYear(), birthdayMonth, birthdayDay);
        
        // If this year's birthday has already passed, use next year
        if (thisYearBirthday < now) {
            return new Date(now.getFullYear() + 1, birthdayMonth, birthdayDay);
        } else {
            return thisYearBirthday;
        }
    };
    
    const x = setInterval(function () {
        const now = new Date().getTime();
        const nextBirthday = calculateNextBirthday();
        const distance = nextBirthday.getTime() - now;
        
        if (distance < 0) {
            dateWrapperNode.textContent = "Happy Birthday! 🎉";
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            dateWrapperNode.textContent = days + "d " + hours + "h until birthday";
        } else if (hours > 0) {
            dateWrapperNode.textContent = hours + "h " + minutes + "m until birthday";
        } else {
            dateWrapperNode.textContent = minutes + "m until birthday";
        }
    }, 1000);
    return dateWrapperNode;
};
const CardMaker = (link, description, id, userNode, userName, purchased, moreDetails, purchasedBy) => {
    var beenPurchased = purchased;
    const itemId = id;
    const parentUserName = userName;
    
    // Check if current user is the one who purchased this item
    const isPurchasedByCurrentUser = purchasedBy === activeUserName;
    const isItemPurchased = beenPurchased && purchasedBy;
    
    // Create a column wrapper for responsive grid
    const colWrapper = document.createElement("div");
    colWrapper.className = "col-12 col-md-6 col-lg-4 mb-3";
    
    const cardWrapperNode = document.createElement("div");
    cardWrapperNode.className = "card h-100 bg-dark border-secondary text-light shadow-sm";
    
    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column";
    
    const linkNode = document.createElement("a");
    linkNode.setAttribute("target", "_blank");
    linkNode.className = "card-title h6 text-decoration-none text-light mb-3";
    
    // Show full details only to the person who purchased it, or if not purchased
    if (!isItemPurchased || isPurchasedByCurrentUser) {
        linkNode.textContent = description;
        linkNode.setAttribute("href", link);
    } else {
        linkNode.textContent = "Item has been purchased";
        linkNode.style.fontStyle = "italic";
        linkNode.style.opacity = "0.7";
        linkNode.removeAttribute("href");
        linkNode.style.cursor = "default";
    }
    
    const purchaseButton = document.createElement("button");
    purchaseButton.className = "btn btn-primary btn-sm me-2";
    
    // Control purchase button visibility and behavior based on purchase status and user
    if (!isItemPurchased) {
        purchaseButton.textContent = "Mark as purchased";
    } else {
        if (isPurchasedByCurrentUser) {
            purchaseButton.textContent = "Remove purchased status";
            purchaseButton.className = "btn btn-info btn-sm me-2";
        } else {
            purchaseButton.textContent = "Purchased by someone else";
            purchaseButton.className = "btn btn-secondary btn-sm me-2";
            purchaseButton.disabled = true;
            purchaseButton.style.opacity = "0.6";
        }
        
        cardWrapperNode.classList.add("border-primary");
        cardWrapperNode.style.background = "linear-gradient(135deg, #0d6efd 0%, #084298 100%)";
        
        // Add purchased badge
        const purchasedBadge = document.createElement("span");
        purchasedBadge.className = "badge bg-primary position-absolute top-0 end-0 m-2";
        purchasedBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Purchased';
        cardWrapperNode.style.position = "relative";
        cardWrapperNode.prepend(purchasedBadge);
        
        // Style the link for purchased items
        linkNode.classList.add("text-decoration-line-through", "text-info");
        linkNode.classList.remove("text-light");
    }
    purchaseButton.addEventListener("click", async (ev) => {
        ev.preventDefault();
        
        // Only allow purchase actions if item is not purchased, or if current user purchased it
        if (!isItemPurchased || isPurchasedByCurrentUser) {
            // Store original button state
            const originalText = purchaseButton.textContent;
            const originalClass = purchaseButton.className;
            
            // Show loading state
            purchaseButton.disabled = true;
            purchaseButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...';
            
            try {
                // Pass the current user as purchasedBy when marking as purchased, null when removing purchase
                const purchasedByValue = !beenPurchased ? activeUserName : null;
                await togglePurchase(id, parentUserName, activeUserName);
                beenPurchased = !beenPurchased;
                
                // Update local variables after toggle
                const newIsItemPurchased = beenPurchased && purchasedByValue;
                const newIsPurchasedByCurrentUser = purchasedByValue === activeUserName;
            
                // ITEM MARKED AS PURCHASED - Apply celebratory green styling with badge and visual effects
                if (beenPurchased) {
                    // Update link visibility based on new purchase state
                    if (!newIsItemPurchased || newIsPurchasedByCurrentUser) {
                        linkNode.textContent = description;
                        linkNode.setAttribute("href", link);
                        linkNode.style.fontStyle = "";
                        linkNode.style.opacity = "";
                        linkNode.style.cursor = "";
                    } else {
                        linkNode.textContent = "Item has been purchased";
                        linkNode.style.fontStyle = "italic";
                        linkNode.style.opacity = "0.7";
                        linkNode.removeAttribute("href");
                        linkNode.style.cursor = "default";
                    }
                    
                    // Style for purchased state
                    purchaseButton.textContent = "Remove purchased status";
                    purchaseButton.className = "btn btn-info btn-sm me-2";
                    cardWrapperNode.classList.add("border-primary");
                    cardWrapperNode.classList.remove("border-secondary");
                    cardWrapperNode.style.background = "linear-gradient(135deg, #0d6efd 0%, #084298 100%)";
                    
                    // Add purchased badge
                    const purchasedBadge = document.createElement("span");
                    purchasedBadge.className = "badge bg-primary position-absolute top-0 end-0 m-2 purchased-badge";
                    purchasedBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Purchased';
                    cardWrapperNode.style.position = "relative";
                    cardWrapperNode.prepend(purchasedBadge);
                    
                    // Style the link for purchased items
                    linkNode.classList.add("text-decoration-line-through", "text-info");
                    linkNode.classList.remove("text-light");
                }
                else {
                    // Update link visibility - item is now unpurchased so show full details
                    linkNode.textContent = description;
                    linkNode.setAttribute("href", link);
                    linkNode.style.fontStyle = "";
                    linkNode.style.opacity = "";
                    linkNode.style.cursor = "";
                    
                    // Style for unpurchased state
                    purchaseButton.textContent = "Mark as purchased";
                    purchaseButton.className = "btn btn-primary btn-sm me-2";
                    cardWrapperNode.classList.remove("border-primary");
                    cardWrapperNode.classList.add("border-secondary");
                    cardWrapperNode.style.background = "";
                    
                    // Remove purchased badge
                    const existingBadge = cardWrapperNode.querySelector(".purchased-badge");
                    if (existingBadge) {
                        existingBadge.remove();
                    }
                    
                    // Reset link styling
                    linkNode.classList.remove("text-decoration-line-through", "text-info");
                    linkNode.classList.add("text-light");
                }
            } catch (error) {
                console.error("Error toggling purchase status:", error);
                // Show error feedback
                purchaseButton.textContent = "Error - Try again";
                purchaseButton.className = "btn btn-danger btn-sm me-2";
                setTimeout(() => {
                    purchaseButton.textContent = originalText;
                    purchaseButton.className = originalClass;
                    purchaseButton.disabled = false;
                }, 2000);
                return;
            } finally {
                // Re-enable button
                purchaseButton.disabled = false;
            }
        }
    });
    const buttonWrapper = document.createElement("div");
    buttonWrapper.append(purchaseButton);
    buttonWrapper.className = "d-flex gap-2 mt-2";
    const descriptionNode = document.createElement("p");
    if (moreDetails != null && moreDetails != "") {
        const showDescriptionButton = document.createElement("button");
    showDescriptionButton.className = "btn btn-secondary btn-sm";
        showDescriptionButton.textContent = "More info";
        showDescriptionButton.addEventListener("click", () => {
            buttonWrapper.removeChild(showDescriptionButton);
            buttonWrapper.append(hideDescription);
            descriptionNode.textContent = moreDetails;
        });
        const hideDescription = document.createElement("button");
    hideDescription.className = "btn btn-outline-secondary btn-sm";
        hideDescription.textContent = "Hide";
        hideDescription.addEventListener("click", () => {
            descriptionNode.textContent = "";
            buttonWrapper.removeChild(hideDescription);
            buttonWrapper.append(showDescriptionButton);
        });
        buttonWrapper.append(showDescriptionButton);
    }
    
    // Assemble the card structure
    cardBody.append(linkNode, descriptionNode);
    
    // Add button wrapper to card footer for better spacing
    const cardFooter = document.createElement("div");
    cardFooter.className = "mt-auto pt-2";
    cardFooter.append(buttonWrapper);
    cardBody.append(cardFooter);
    
    cardWrapperNode.append(cardBody);
    colWrapper.append(cardWrapperNode);
    userNode.append(colWrapper);
};
const GenerateList = (familyList) => {
    contentNode.replaceChildren();
    familyList.forEach((user) => {
        if (user.items != null) {
            if (user.userName != activeUserName) {
                const userSection = document.createElement("div");
                userSection.className = "mb-5";
                userSection.setAttribute("id", user.userName);
                
                const userTitle = document.createElement("h2");
                userTitle.className = "text-light mb-3";
                userTitle.textContent =
                    user.userName.charAt(0).toUpperCase() + user.userName.slice(1);
                userSection.append(userTitle);
                
                console.log(user);
                if (user.birthDay != null) {
                    userSection.append(existingCountDown(user.birthDay));
                }
                
                // Create row for responsive grid
                const userItemsRow = document.createElement("div");
                userItemsRow.className = "row g-3";
                
                user.items.forEach((item) => {
                    CardMaker(item.value.link, item.value.description, item.key, userItemsRow, user.userName, item.value.purchased, item.value.moreDetails, item.value.purchasedBy);
                });
                
                userSection.append(userItemsRow);
                contentNode?.append(userSection);
            }
        }
    });
};
const makeFilter = () => {
    const filterWrapper = document.createElement("div");
    filterWrapper.className = "mb-4";
    
    // Create input group container for better styling
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group input-group-lg";
    
    // Create search icon span
    const searchIconSpan = document.createElement("span");
    searchIconSpan.className = "input-group-text bg-dark border-secondary text-light";
    searchIconSpan.innerHTML = '<i class="bi bi-search"></i>';
    
    const filterInput = document.createElement("input");
    filterInput.setAttribute("type", "text");
    filterInput.setAttribute("id", "filterBar");
    filterInput.setAttribute("placeholder", "Search...");
    filterInput.className = "form-control bg-dark text-light border-secondary";
    filterInput.style.fontSize = "1rem";
    
    // Add focus styling
    filterInput.addEventListener("focus", () => {
        inputGroup.classList.add("shadow-lg");
        searchIconSpan.classList.remove("border-secondary");
        searchIconSpan.classList.add("border-primary");
        filterInput.classList.remove("border-secondary");
        filterInput.classList.add("border-primary");
    });
    
    filterInput.addEventListener("blur", () => {
        inputGroup.classList.remove("shadow-lg");
        searchIconSpan.classList.remove("border-primary");
        searchIconSpan.classList.add("border-secondary");
        filterInput.classList.remove("border-primary");
        filterInput.classList.add("border-secondary");
    });
    
    // Create clear button
    const clearButton = document.createElement("button");
    clearButton.className = "btn btn-outline-secondary border-secondary";
    clearButton.type = "button";
    clearButton.innerHTML = '<i class="bi bi-x-lg"></i>';
    clearButton.title = "Clear search";
    clearButton.style.display = "none";
    
    // Clear functionality
    clearButton.addEventListener("click", () => {
        filterInput.value = "";
        clearButton.style.display = "none";
        GenerateList(myFam);
        filterInput.focus();
    });
    
    // Search functionality with improved UX
    filterInput.addEventListener("input", () => {
        const searchTerm = filterInput.value.trim().toLowerCase();
        
        // Show/hide clear button
        if (searchTerm) {
            clearButton.style.display = "block";
        } else {
            clearButton.style.display = "none";
        }
        
        // Perform search (case-insensitive)
        const filteredFamily = myFam.filter((u) => 
            u.userName.toLowerCase().includes(searchTerm)
        );
        GenerateList(filteredFamily);
    });
    
    // Assemble the input group
    inputGroup.append(searchIconSpan, filterInput, clearButton);
    filterWrapper.append(inputGroup);
    parentNode?.append(filterWrapper);
};
const familyList = document.getElementById("familyList");
familyList?.setAttribute("href", `./familyListPagePrototype.html?user=${activeUserName}`);
const userList = document.getElementById("userList");
userList?.setAttribute("href", `./userListPagePrototype.html?user=${activeUserName}`);
GenerateList(myFam);
makeFilter();
parentNode?.append(contentNode);
//# sourceMappingURL=familyListUi.js.map