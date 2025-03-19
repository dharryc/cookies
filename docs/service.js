import { rootUrl } from "./constants.js";
export const currentUser = async (userName) => {
  const userPromise = await fetch(`${rootUrl}/user/${userName}`);
  const userObj = await userPromise.json();
  return userObj;
};
export const addNewItem = async (mylink, mydescription, userName) => {
  const thisItem = {
    link: mylink,
    description: mydescription,
  };
  await fetch(`${rootUrl}/user/${userName}/addItem/${Date.now()}`, {
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
//# sourceMappingURL=service.js.map
