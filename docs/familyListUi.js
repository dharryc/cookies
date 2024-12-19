import { togglePurchase, allUsers, getFamily } from "./familyListService.js";
const unprocessedFam = await allUsers();
const myFam = await getFamily(unprocessedFam);
const userNameInUrl = new URLSearchParams(window.location.search);
const activeUserName = userNameInUrl.get("user");
const parentNode = document.getElementById("pageContent");
const contentNode = document.createElement("div");
const existingCountDown = (countDownDate) => {
    const dateWrapperNode = document.createElement("h4");
    const x = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        dateWrapperNode.textContent = days + "d " + hours + "h " + "until birthday";
    }, 1000);
    return dateWrapperNode;
};
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
            console.log("there's more details" + moreDetails);
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
const GenerateList = (familyList) => {
    contentNode.replaceChildren();
    familyList.forEach((user) => {
        if (user.items != null) {
            if (user.userName != activeUserName) {
                const userNode = document.createElement("div");
                userNode.setAttribute("id", user.userName);
                const userTitle = document.createElement("h2");
                userTitle.textContent =
                    user.userName.charAt(0).toUpperCase() + user.userName.slice(1);
                userNode.append(userTitle);
                if (user.birthDay != null) {
                    userNode.append(existingCountDown(user.birthDay));
                }
                user.items.forEach((item) => {
                    CardMaker(item.value.link, item.value.description, item.key, userNode, user.userName, item.value.purchased, item.value.moreDetails);
                    console.log(item.value.moreDetails);
                });
                contentNode?.append(userNode);
            }
        }
    });
};
const makeFilter = () => {
    const filterWrapper = document.createElement("div");
    filterWrapper.setAttribute("id", "filterBar");
    const filterLabel = document.createElement("label");
    filterLabel.setAttribute("for", "filterBar");
    filterLabel.textContent = "Search for person:";
    const filterInput = document.createElement("input");
    filterInput.setAttribute("type", "text");
    filterInput.addEventListener("input", () => {
        const filteredFamily = myFam.filter((u) => u.userName.includes(filterInput.value));
        GenerateList(filteredFamily);
    });
    filterWrapper.append(filterLabel, filterInput);
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