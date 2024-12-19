import { rootUrl } from "./constants.js";
export const validateUser = async (user) => {
    const users = await fetch(`${rootUrl}/userList`);
    const usersObj = await users.json();
    if (usersObj.includes(user)) {
        return true;
    }
    return false;
};
//# sourceMappingURL=loginService.js.map