import { Page } from "puppeteer-core";
import utils from "../utils";
import { Config } from "..";
import macroUtils from "../utils/macro";
type NaverPlaceMobileConfig = {
  keyword: string;
  mid: number;
} & Config;

let LocalConfig: NaverPlaceMobileConfig;

const gotoNaverMain = async (page: Page) => {
  await page.goto("https://m.naver.com");
  await utils.sleep(utils.getRandomSecTuple(LocalConfig.waitTimeList[0]));
  return page;
};

const searchKeyword = async (page: Page) => {
  await page.waitForSelector("#MM_SEARCH_FAKE");
  await page.type("#MM_SEARCH_FAKE", LocalConfig.keyword);
  await page.keyboard.down("Enter");
  await utils.sleep(utils.getRandomSecTuple(LocalConfig.waitTimeList[1]));
  return page;
};

const searchTargetItem: any = async (page: Page) => {
  const waitTimeList = LocalConfig.waitTimeList;
  const scrollTimeList = LocalConfig.scrollTimeList;
  try {
    await (page as any)
      .locator(`li[data-cbm-doc-id="${LocalConfig.mid}"] a`)
      .click();
  } catch (e) {
    const selector = `[data-loc_plc-doc-id="${LocalConfig.mid}"] .ouxiq > a`;
    await page.locator(selector).click();
  }

  await utils.sleep(utils.getRandomSecTuple(LocalConfig.waitTimeList[2]));
  // 0, 리뷰 스크롤
  for await (let i of Array(scrollTimeList[0][0]).keys()) {
    await page.mouse.wheel({ deltaY: scrollTimeList[0][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[0].slice(2) as [number, number])
    );
  }
  await page.click(`.place_fixed_maintab .flicking-camera a[href*="around"]`);
  await utils.sleep(utils.getRandomSecTuple(LocalConfig.waitTimeList[3]));
  for await (let i of Array(scrollTimeList[1][0]).keys()) {
    await page.mouse.wheel({ deltaY: scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[1].slice(2) as [number, number])
    );
  }
  await page.click(`.place_fixed_subtab .flicking-camera span:nth-child(4)`);
  await utils.sleep(utils.getRandomSecTuple(LocalConfig.waitTimeList[4]));
  await page.click(
    `.place_fixed_maintab .flicking-camera a[href*="/${LocalConfig.mid}/review"]`
  );
  await utils.sleep(utils.getRandomSecTuple(LocalConfig.waitTimeList[5]));
  for await (let i of Array(scrollTimeList[2][0]).keys()) {
    await page.mouse.wheel({ deltaY: scrollTimeList[2][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[2].slice(2) as [number, number])
    );
  }
  await utils.sleep(utils.getRandomSecTuple(LocalConfig.waitTimeList[6]));
  for await (let i of Array(scrollTimeList[3][0]).keys()) {
    await page.mouse.wheel({ deltaY: scrollTimeList[3][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[3].slice(2) as [number, number])
    );
  }
  return page;
};

export const process = async (localConfig: NaverPlaceMobileConfig) => {
  LocalConfig = localConfig;
  const browser = await utils.getBrowser(localConfig, true);
  try {
    let page = ((await browser.pages()) as any)[0];

    page = await gotoNaverMain(page);
    page = await searchKeyword(page);
    let pages = await browser.pages();
    page = pages[pages.length - 1];
    await searchTargetItem(page);
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};
