import { currentUser, addNewItem, getUserItems, deleteItem, addDate, addMoreDescription, } from "./userService.js";
const userNameInUrl = new URLSearchParams(window.location.search);
const activeUserName = userNameInUrl.get("user");
const CardMaker = (link, description, id, moreDetails) => {
    const contentNode = document.getElementById("pageContent");
    const cardWrapperNode = document.createElement("div");
    cardWrapperNode.setAttribute("id", id.toString());
    cardWrapperNode.classList.add("itemCard");
    const linkAndPriorityWrapper = document.createElement("div");
    linkAndPriorityWrapper.setAttribute("id", "priorityAndLink");
    // const priorityTag = document.createElement("div");
    // priorityTag.textContent = "Default";
    const linkNode = document.createElement("a");
    linkNode.setAttribute("target", "_blank");
    linkNode.textContent = description;
    linkNode.setAttribute("href", link);
    const descriptionNode = document.createElement("p");
    descriptionNode.textContent = moreDetails;
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("button");
    deleteButton.textContent = "Delete Item";
    deleteButton.addEventListener("click", async () => {
        await deleteItem(activeUserName, id);
        await cardGenerator();
        contentNode?.removeChild(cardWrapperNode);
    });
    const descriptionBox = document.createElement("textarea");
    const buttonWrapper = document.createElement("div");
    buttonWrapper.setAttribute("id", "userButtons");
    const longerDescriptionButton = document.createElement("button");
    longerDescriptionButton.classList.add("button");
    longerDescriptionButton.textContent = "Add description";
    longerDescriptionButton.addEventListener("click", () => {
        buttonWrapper.removeChild(longerDescriptionButton);
        cardWrapperNode.append(descriptionBox);
        cardWrapperNode.append(descriptionSubmissionButton);
        buttonWrapper.removeChild(deleteButton);
        descriptionBox.value = moreDetails;
    });
    const descriptionSubmissionButton = document.createElement("button");
    descriptionSubmissionButton.classList.add("button");
    descriptionSubmissionButton.textContent = "Confirm description";
    descriptionSubmissionButton.addEventListener("click", async () => {
        await addMoreDescription(activeUserName, id, descriptionBox.value);
        descriptionNode.textContent = descriptionBox.value;
        buttonWrapper.append(longerDescriptionButton);
        cardWrapperNode.removeChild(descriptionBox);
        cardWrapperNode.removeChild(descriptionSubmissionButton);
        buttonWrapper.append(deleteButton);
    });
    linkAndPriorityWrapper.append(linkNode);
    buttonWrapper.append(deleteButton, longerDescriptionButton);
    cardWrapperNode.append(linkAndPriorityWrapper, descriptionNode, buttonWrapper);
    contentNode?.append(cardWrapperNode);
};
const formMaker = () => {
    const formNode = document.getElementById("form");
    const inputParentNode = document.createElement("form");
    inputParentNode.setAttribute("action", "submit");
    inputParentNode.setAttribute("id", "itemForm");
    const itemTitleNode = document.createElement("input");
    itemTitleNode.setAttribute("type", "text");
    itemTitleNode.setAttribute("id", "title");
    itemTitleNode.setAttribute("name", "title");
    const titleLabel = document.createElement("label");
    titleLabel.setAttribute("for", "title");
    titleLabel.textContent = "Description of your item:";
    const itemLinkNode = document.createElement("input");
    itemLinkNode.setAttribute("type", "text");
    itemTitleNode.setAttribute("id", "link");
    itemTitleNode.setAttribute("name", "link");
    const linkLabel = document.createElement("label");
    linkLabel.setAttribute("for", "link");
    linkLabel.textContent = "Link for your item:";
    const inputButtonNode = document.createElement("button");
    inputButtonNode.classList.add("button");
    inputButtonNode.textContent = "Add Item";
    inputParentNode.addEventListener("submit", (ev) => {
        ev.preventDefault();
    });
    inputButtonNode.addEventListener("click", async (ev) => {
        const id = Date.now();
        await addNewItem(itemLinkNode.value, itemTitleNode.value, activeUserName, id);
        CardMaker(itemLinkNode.value, itemTitleNode.value, id, "");
        itemTitleNode.value = "";
        itemLinkNode.value = "";
    });
    inputParentNode.append(titleLabel, itemTitleNode, linkLabel, itemLinkNode, inputButtonNode);
    formNode?.append(inputParentNode);
};
const countDownAdder = () => {
    const countDownForm = document.createElement("form");
    countDownForm.setAttribute("action", "submit");
    countDownForm.setAttribute("id", "dateForm");
    countDownForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
    });
    const dayPicker = document.createElement("input");
    dayPicker.setAttribute("type", "date");
    dayPicker.setAttribute("id", "eventDate");
    dayPicker.setAttribute("name", "eventDate");
    const dayLabel = document.createElement("label");
    dayLabel.setAttribute("for", "eventDate");
    dayLabel.textContent = "Set birthday: ";
    const submitButton = document.createElement("button");
    submitButton.classList.add("button");
    submitButton.textContent = "Confirm date";
    const confirmationParagraph = document.createElement("p");
    submitButton.addEventListener("click", async (ev) => {
        await addDate(activeUserName, dayPicker.valueAsNumber);
        confirmationParagraph.textContent = "Birthday added!";
    });
    countDownForm.append(dayLabel, dayPicker, submitButton, confirmationParagraph);
    document.getElementById("form")?.append(countDownForm);
};
formMaker();
countDownAdder();
const cardGenerator = async () => {
    document.getElementById("pageContent")?.replaceChildren();
    const activeUser = (await currentUser(activeUserName));
    activeUser.items = await getUserItems(activeUserName);
    activeUser.items?.forEach((item) => {
        CardMaker(item.value.link, item.value.description, item.key, item.value.moreDetails);
    });
};
const familyList = document.getElementById("familyList");
familyList?.setAttribute("href", `./familyListPagePrototype.html?user=${activeUserName}`);
const userList = document.getElementById("userList");
userList?.setAttribute("href", `./userListPagePrototype.html?user=${activeUserName}`);
cardGenerator();
console.log(`http://dharryc.github.io/cookies/shareList.html?user=${activeUserName}`);
//# sourceMappingURL=userUi.js.map