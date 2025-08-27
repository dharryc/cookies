import { getUserItems, currentUser, deleteItem } from "./userService.js";
import { togglePurchase } from "./familyListService.js";
import { act } from "react";
const userNameInUrl = new URLSearchParams(window.location.search);
const activeUserName = userNameInUrl.get("user");

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
        for (const item of itemsToDelete) {
            try {
                await deleteItem(user.userName, item.key);
                console.log(`Auto-deleted purchased item: ${item.value.description}`);
            } catch (error) {
                console.error(`Failed to auto-delete item ${item.key}:`, error);
            }
        }
        
        // If items were deleted, reload the page to show updated list
        if (itemsToDelete.length > 0) {
            console.log(`Auto-deleted ${itemsToDelete.length} purchased items past birthday cleanup period`);
            window.location.reload();
        }
    }
};

const CardMaker = (link, description, id, userNode, userName, purchased, moreDetails, purchasedBy) => {
    var beenPurchased = purchased;
    const itemId = id;
    const parentUserName = userName;
    
    // Check if current user is the one who purchased this item
    const isPurchasedByCurrentUser = purchasedBy === activeUserName;
    const isItemPurchased = beenPurchased && purchasedBy;
    
    const cardWrapperNode = document.createElement("div");
    cardWrapperNode.className = "card my-3 p-3 bg-dark border-secondary text-light";
    const linkNode = document.createElement("a");
    linkNode.setAttribute("target", "_blank");
    
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
        cardWrapperNode.classList.add("border-warning", "opacity-50");
        
        // Add purchased badge for all purchased items
        const purchasedBadge = document.createElement("span");
        purchasedBadge.className = "badge bg-primary position-absolute top-0 end-0 m-2 purchased-badge";
        purchasedBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Purchased';
        cardWrapperNode.style.position = "relative";
        cardWrapperNode.prepend(purchasedBadge);
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
                if (beenPurchased) {
                    purchaseButton.textContent = "Remove purchased status";
                    cardWrapperNode.classList.add("border-warning", "opacity-50");
                    
                    // Add purchased badge
                    const purchasedBadge = document.createElement("span");
                    purchasedBadge.className = "badge bg-primary position-absolute top-0 end-0 m-2 purchased-badge";
                    purchasedBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Purchased';
                    cardWrapperNode.style.position = "relative";
                    cardWrapperNode.prepend(purchasedBadge);
                }
                else {
                    purchaseButton.textContent = "Mark as purchased";
                    cardWrapperNode.classList.remove("border-warning", "opacity-50");
                    
                    // Remove purchased badge
                    const existingBadge = cardWrapperNode.querySelector(".purchased-badge");
                    if (existingBadge) {
                        existingBadge.remove();
                    }
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
    cardWrapperNode.append(linkNode, descriptionNode, buttonWrapper);
    userNode.append(cardWrapperNode);
};
console.log("working");
const thing = document.getElementById("pageContent");
const userNode = document.createElement("div");
const user = (await currentUser(activeUserName));
user.items = await getUserItems(activeUserName);

// Run auto-cleanup for purchased items past birthday cleanup period
await autoDeletePurchasedItems(user);

user.items?.forEach((item) => {
    CardMaker(item.value.link, item.value.description, item.key, userNode, user.userName, item.value.purchased, item.value.moreDetails, item.value.purchasedBy);
});
thing?.append(userNode);
//# sourceMappingURL=shareUi.js.map