import { Page } from "puppeteer-core";
import utils from ".";

const NaverMacroUtil = {
  mobile: {
    goToNaverMain: async (page: Page) => {
      await page.goto("https://m.naver.com");
      return page;
    },
    clickShoppingTab: async (page: Page) => {
      await page.locator(`[data-clk="shortallser"]`).click();
      await utils.sleep(500);
      await page.locator(`[href*="https://shopping.naver.com/home"]`).click();
      return page;
    },
    searchKeyword: async (page: Page, keyword: string) => {
      await page.waitForSelector("#MM_SEARCH_FAKE");
      await page.type("#MM_SEARCH_FAKE", keyword);
      await page.keyboard.down("Enter");
      return page;
    },
    shoppingSearchKeyword: async (page: Page, keyword: string) => {
      await page.locator("#gnb-gnb button").click();
      await utils.sleep(100);
      await page.type("#input_text", keyword);
      await page.keyboard.down("Enter");
      return page;
    },
    clickShoppingMore: async (page: Page) => {
      await utils.sleep(500);
      try {
        await page
          .locator(
            `.flick_bx [href*="https://msearch.shopping.naver.com/search/all"][role="tab"]`
          )
          .click();
      } catch (e) {
        try {
          await page
            .locator(
              `a[data-landing-url*="https://msearch.shopping.naver.com"]`
            )
            .click();
        } catch (e) {
          throw new Error("no click");
        }
      }

      return page;
    },
  },
  pc: {
    goToNaverMain: async (page: Page) => {
      await page.goto("https://www.naver.com/");
      return page;
    },
    searchKeyword: async (page: Page, keyword: string) => {
      await page.waitForSelector("#query");
      await page.type("#query", keyword);
      await page.click("#search-btn");
      return page;
    },
    clickShoppingTab: async (page: Page) => {
      await page
        .locator(
          `.flick_bx [href*="https://search.shopping.naver.com/search/all"][role="tab"]`
        )
        .click();
      return page;
    },
    shoppingSearchKeyword: async (page: Page, keyword: string) => {
      console.log("shoppingSearchKeyword", keyword);
      await page.waitForSelector(`[name="search"] input`);
      await page.type(`[name="search"] input`, keyword);
      await page.keyboard.down("Enter");
      return page;
    },
    clickShoppingNavigatition: async (page: Page, pageNumber: number) => {
      console.log("pagenumber: ", pageNumber);
      await page
        .locator(
          `a[class*="pagination_btn_page"][data-shp-contents-id="${pageNumber}"]`
        )
        .click();
    },
    clickShoppingTargetItem: async (page: Page, mid: string) => {
      const targetSelector = `a[data-i="${mid}"]:not([class^="ad"]):not([class^="thumb"])[class^="product_link"]`;
      const res = await page.$(targetSelector);
      if (res) {
        await page.click(targetSelector);
        return true;
      }
      return false;
    },
  },
};

export default NaverMacroUtil;
