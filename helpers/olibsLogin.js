import puppeteer from "puppeteer";

/**
 * Logs in to the olibsbesy website with the given username and password.
 *
 * @param {string} username - The username to log in with.
 * @param {string} password - The password to log in with.
 * @return {Object} An object containing the login status, login ID, browser, and page.
 */

export const olibsLogin = async (username, password) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("http://114.4.135.141:17003/olibsbesy/", {
      waitUntil: "networkidle0",
    });

    const beforeLoginId = await page.evaluate(() => {
      const id = document.querySelector("body").firstElementChild.id;
      return id.replace(/_/g, "");
    });

    const usernameInput = await page.$(`input#${beforeLoginId}c`);
    const passwordInput = await page.$(`input#${beforeLoginId}f`);

    await usernameInput.type(username);
    await passwordInput.type(password);

    const loginButtonSelector = "td[class='z-button-cm']";
    await page.click(loginButtonSelector);

    await page.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 10000,
    });

    const afterLoginId = await page.evaluate(() => {
      const id = document.querySelector("body").firstElementChild.id;
      return id.replace(/_/g, "");
    });

    const aladinLogo = await page.waitForSelector(`img#${afterLoginId}al`);

    if (!aladinLogo) {
      return { isLoggedIn: false, login_id: "", browser, page };
    }

    return { isLoggedIn: true, login_id: afterLoginId, browser, page };
  } catch (error) {
    console.error("An error occurred : ", error);
    return { isLoggedIn: false, login_id: "", browser, page };
  }
};
