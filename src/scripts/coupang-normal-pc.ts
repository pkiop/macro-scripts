import { Page } from "puppeteer";
import { Config } from "..";
import utils from "../utils";

type CoupangNormalConfig = {
  keyword: string;
  mid: string;
} & Config;

export const process = async (localConfig: CoupangNormalConfig) => {
  console.log("direct link process start");
  console.log("localConfig : ", localConfig);
  const browser = await utils.getBrowser(localConfig);
  try {
    const keyword = localConfig.keyword;
    const mid = localConfig.mid;
    const maxPage = 20;
    let page = (await browser.pages())[0] as Page;

    await utils.sleep(500);
    await page.goto("https://www.coupang.com", {
      waitUntil: "domcontentloaded",
    });
    await utils.sleep(1000);

    try {
      await page.waitForSelector("#bottomSheetBudgeCloseButton", {
        timeout: 1000,
      });
      await page.click("#bottomSheetBudgeCloseButton");
      await utils.sleep(500);
    } catch (e) {
      console.log("pass");
    }
    try {
      await page.waitForSelector(".close-banner", {
        timeout: 1000,
      });
      await page.click(".close-banner");
    } catch (e) {
      console.log("pass");
    }
    try {
      await page.waitForSelector(".close-banner", {
        timeout: 1000,
      });
      await page.click(".close-banner");
      await utils.sleep(500);
    } catch (e) {
      console.log("pass");
    }

    // // Close banner logic
    // const closeBannerSelector = ".close-banner";
    // try {
    //   for (let i = 0; i < 3; i++) {
    //     await page.waitForSelector(closeBannerSelector, { timeout: 1000 });
    //     await page.click(closeBannerSelector);
    //     await utils.sleep(300);
    //   }
    // } catch (error) {
    //   console.log("No more banners to close.");
    // }

    // Type keyword and search
    await page.type("#headerSearchKeyword", keyword, { delay: 100 });
    await utils.sleep(500);
    try {
      await page.goto(
        `https://www.coupang.com/np/search?component=&q=${keyword}&channel=user`
      );
    } catch (e) {
      await page.goto(
        `https://www.coupang.com/np/search?component=&q=${keyword}&channel=user`
      );
    }

    // await page.click("#headerSearchBtn");
    await utils.sleep(5000);

    let cloc = -1;

    for (let loc = 2; loc <= maxPage; loc++) {
      // Scroll through the page
      for (let i = 0; i < 13; i++) {
        await page.evaluate((scrollY) => {
          window.scrollBy(0, scrollY);
        }, 500 * i);
        await utils.sleep(500);
      }

      // Check if the element exists
      try {
        await page.click(`[data-item-id="${mid}"]`);
        console.log("Found item with data-item-id", mid);
        cloc = loc - 1;
        break;
      } catch (ee) {
        console.log("Item not found on page", loc - 1);
        // Go to the next page
        const nextPageSelector = `[data-page="${loc}"]`;
        try {
          console.log("nextPAge : ", nextPageSelector);
          await page.click(nextPageSelector);
          await utils.sleep(3000);
        } catch (e) {
          console.log("Next page button not found.");
        }
      }
    }

    console.log("Last successful page:", cloc);

    // Scroll and click a random internal link
    for (let i = 0; i < 13; i++) {
      await page.evaluate((scrollY) => {
        window.scrollBy(0, scrollY);
      }, 500 * i);
      await utils.sleep(500);
    }

    const links = await page.$$eval("a", (anchors) =>
      anchors.map((a) => a.href).filter((href) => href)
    );
    if (links.length > 0) {
      const randomLink = links[Math.floor(Math.random() * links.length)];
      console.log("Navigating to random link:", randomLink);
      await page.goto(randomLink, { waitUntil: "domcontentloaded" });
    } else {
      console.log("No links found to click.");
    }

    await utils.sleep(10000);
    await browser.close();
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};
