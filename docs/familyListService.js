import { getUserItems } from "./userService.js";
import { rootUrl } from "./constants.js";
export const togglePurchase = async (itemId, userName, purchasingUser) => {
    await fetch(`${rootUrl}/${userName}/${itemId}/${purchasingUser}`);
};
export const allUsers = async () => {
    const usersPromise = await fetch(`${rootUrl}/allUsers`);
    const userList = await usersPromise.json();
    return userList;
};
export const getFamily = async (famList) => {
    const returnList = Promise.all(famList.map(async (user) => {
        const modifiedUser = user;
        modifiedUser.items = await getUserItems(user.userName);
        return modifiedUser;
    }));
    return returnList;
};
//# sourceMappingURL=familyListService.js.map