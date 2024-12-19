import { rootUrl } from "./constants.js";
export const DeleteUser = async (username) => {
    await fetch(`${rootUrl}/user/${username}/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
};
//# sourceMappingURL=userDeleteService.js.map