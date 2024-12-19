import { currentUser, addNewItem, getUserItems } from "./service.js";
const CardMaker = (link, description) => {
    const contentNode = document.getElementById("pageContent");
    const cardWrapperNode = document.createElement("div");
    cardWrapperNode.classList.add("itemCard");
    const linkNode = document.createElement("a");
    linkNode.textContent = description;
    linkNode.setAttribute("href", link);
    cardWrapperNode.append(linkNode);
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
    inputButtonNode.textContent = "Add Item";
    inputParentNode.addEventListener("submit", (ev) => {
        ev.preventDefault();
    });
    inputButtonNode.addEventListener("click", async (ev) => {
        await addNewItem(itemLinkNode.value, itemTitleNode.value, activeUser.userName);
        CardMaker(itemLinkNode.value, itemTitleNode.value);
        itemTitleNode.value = "";
        itemLinkNode.value = "";
    });
    inputParentNode.append(titleLabel, itemTitleNode, linkLabel, itemLinkNode, inputButtonNode);
    formNode?.append(inputParentNode);
};
formMaker();
const userNameInUrl = new URLSearchParams(window.location.search);
const activeUserName = userNameInUrl.get("user");
const activeUser = (await currentUser(activeUserName));
activeUser.items = await getUserItems(activeUserName);
activeUser.items?.forEach((item) => {
    CardMaker(item.value.link, item.value.description);
});
const familyList = document.getElementById("familyList");
familyList?.setAttribute("href", `./familyListPagePrototype.html?user=${activeUser.userName}`);
const userList = document.getElementById("userList");
userList?.setAttribute("href", `./userListPagePrototype.html?user=${activeUser.userName}`);
//# sourceMappingURL=serviceTest.js.map