import { rootUrl } from "./constants.js";
export const makeUser = async (user) => {
    await fetch(`${rootUrl}/newUser`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json",
        },
    });
};
export const userNameVerification = async (userName) => {
    const userNameList = await fetch(`${rootUrl}/userList`);
    const userNameObj = await userNameList.json();
    if (userNameObj.includes(userName.toLocaleLowerCase())) {
        return "That username already exists. Please contact Harry if the site is broken, or log in again with the same name";
    }
    else {
        await makeUser({ userName: userName.toLowerCase(), id: Date.now() });
        return "User successfully created";
    }
};
//# sourceMappingURL=userCreationService.js.map