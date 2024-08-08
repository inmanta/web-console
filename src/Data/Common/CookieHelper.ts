/**
 * Creates a new cookie with the specified name, value, and expiration time.
 * @param {string} cookieName - The name of the cookie.
 * @param {string} cookieValue - The value to be stored in the cookie.
 * @param {number} hoursToExpire - The number of hours until the cookie expires.
 */
export const createCookie = (
  cookieName: string,
  cookieValue: string,
  hoursToExpire: number,
) => {
  const date = new Date();
  date.setTime(date.getTime() + hoursToExpire * 60 * 60 * 1000);
  document.cookie =
    cookieName +
    " = " +
    cookieValue +
    ";Path=/; Expires = " +
    date.toUTCString();
};

/**
 * Retrieves the value of the specified cookie.
 * @param {string} cookieName - The name of the cookie to retrieve.
 * @returns {string | null} The value of the cookie if found, otherwise null.
 */
export const getCookie = (cookieName: string): string | null => {
  const cookieArray = document.cookie.split(";");
  const searchedCookie = cookieArray.find((cookie: string) =>
    cookie.includes(cookieName),
  );

  if (searchedCookie) {
    //slice of the amount that equals to cookieName + '=' sign
    return searchedCookie.slice(cookieName.length + 1);
  } else {
    return null;
  }
};

/**
 * Removes the specified cookie.
 * @param {string} cookieName - The name of the cookie to be removed.
 */
export const removeCookie = (cookieName: string): void => {
  document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};
