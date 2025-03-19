import { getUserItems, currentUser } from "./userService.js";
import { togglePurchase } from "./familyListService.js";
const userNameInUrl = new URLSearchParams(window.location.search);
const activeUserName = userNameInUrl.get("user");
const CardMaker = (link, description, id, userNode, userName, purchased, moreDetails) => {
    var beenPurchased = purchased;
    const itemId = id;
    const parentUserName = userName;
    const cardWrapperNode = document.createElement("div");
    cardWrapperNode.classList.add("itemCard");
    const linkNode = document.createElement("a");
    linkNode.setAttribute("target", "_blank");
    linkNode.textContent = description;
    linkNode.setAttribute("href", link);
    const purchaseButton = document.createElement("button");
    purchaseButton.classList.add("button");
    if (!beenPurchased)
        purchaseButton.textContent = "Mark as purchased";
    else {
        purchaseButton.textContent = "Remove purchased status";
        cardWrapperNode.classList.add("purchased");
    }
    purchaseButton.addEventListener("click", async (ev) => {
        ev.preventDefault();
        await togglePurchase(id, parentUserName);
        beenPurchased = !beenPurchased;
        if (beenPurchased) {
            purchaseButton.textContent = "Remove purchased status";
            cardWrapperNode.classList.add("purchased");
        }
        else {
            purchaseButton.textContent = "Mark as purchased";
            cardWrapperNode.classList.remove("purchased");
        }
    });
    const buttonWrapper = document.createElement("div");
    buttonWrapper.append(purchaseButton);
    buttonWrapper.setAttribute("id", "userButtons");
    const descriptionNode = document.createElement("p");
    if (moreDetails != null && moreDetails != "") {
        const showDescriptionButton = document.createElement("button");
        showDescriptionButton.classList.add("button");
        showDescriptionButton.textContent = "More info";
        showDescriptionButton.addEventListener("click", () => {
            buttonWrapper.removeChild(showDescriptionButton);
            buttonWrapper.append(hideDescription);
            descriptionNode.textContent = moreDetails;
        });
        const hideDescription = document.createElement("button");
        hideDescription.classList.add("button");
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
user.items?.forEach((item) => {
    CardMaker(item.value.link, item.value.description, item.key, userNode, user.userName, item.value.purchased, item.value.moreDetails);
});
thing?.append(userNode);
//# sourceMappingURL=shareUi.js.map