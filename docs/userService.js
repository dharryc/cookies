import { rootUrl } from "./constants.js";
export const currentUser = async (userName) => {
    const userPromise = await fetch(`${rootUrl}/user/${userName}`);
    const userObj = await userPromise.json();
    return userObj;
};
export const addNewItem = async (mylink, mydescription, userName, id) => {
    const thisItem = {
        link: mylink,
        description: mydescription,
    };
    await fetch(`${rootUrl}/user/${userName}/addItem/${id}`, {
        method: "POST",
        body: JSON.stringify(thisItem),
        headers: {
            "Content-Type": "application/json",
        },
    });
};
export const getUserItems = async (userName) => {
    const itemsPromise = await fetch(`${rootUrl}/${userName}/items`);
    const itemsObj = await itemsPromise.json();
    return itemsObj;
};
export const deleteItem = async (userName, itemId) => {
    await fetch(`${rootUrl}/${userName}/${itemId}/deleteItem`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
};
export const addDate = async (userName, birthDay) => {
    await fetch(`${rootUrl}/${userName}/${birthDay}/setBirthday`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
};
export const addMoreDescription = async (userName, itemId, description) => {
    await fetch(`${rootUrl}/${userName}/${itemId}/addDetails`, {
        method: "POST",
        body: JSON.stringify(description),
        headers: {
            "Content-Type": "application/json",
        },
    });
};
//# sourceMappingURL=userService.js.map