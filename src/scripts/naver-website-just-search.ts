import { Page } from "puppeteer-core";
import config from "../config";
import utils from "../utils";
import { Config } from "..";
type NaverWebsiteJustSearchConfig = {
  keyword: string;
} & Config;

let LocalConfig: NaverWebsiteJustSearchConfig;

const gotoNaverMain = async (page: Page) => {
  await page.goto(config.NAVER_MAIN_URL);
  return page;
};

const searchKeyword = async (page: Page) => {
  await page.waitForSelector("#query");
  await page.type("#query", LocalConfig.keyword);
  await page.click("#search-btn");
  return page;
};

const adventure = async (page: Page, config: NaverWebsiteJustSearchConfig) => {
  const randomSec = utils.getRandomSec(
    config.startWaitSecStart,
    config.startWaitSecEnd
  );
  await utils.sleep(randomSec);
  let acc = 0;
  for await (let i of Array(config.scrollCount).keys()) {
    console.log("wheel , ", i);
    const randomSec = utils.getRandomSec(3, 5);
    acc += randomSec / 10;

    await page.mouse.wheel({ deltaY: acc });
    await utils.sleep(500);
  }
  // await utils.sleep(utils.getRandomSec(5, 10));
  // for await (let i of Array(10).keys()) {
  //   console.log("wheel , ", i);
  //   const randomSec = utils.getRandomSec(1, 2);

  //   await page.mouse.wheel({ deltaY: -(randomSec / 3) * i });
  //   await utils.sleep(randomSec);
  // }

  console.log("adventure finish");
  return page;
};

export const process = async (localConfig: NaverWebsiteJustSearchConfig) => {
  LocalConfig = localConfig;
  const browser = await utils.getBrowser(localConfig);
  try {
    let page = ((await browser.pages()) as any)[0];

    page = await gotoNaverMain(page);
    page = await searchKeyword(page);
    await utils.sleep(2000);

    await adventure(page, localConfig);

    await utils.sleep(5000);
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};
