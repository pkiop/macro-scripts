import { Page } from "puppeteer";
import config from "../config";
import utils from "../utils";
import { Config } from "..";
type NaverWebsiteConfig = {
  keyword: string;
  url: string;
} & Config;

let LocalConfig: NaverWebsiteConfig;

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

const click2Page = async (page: Page) => {
  await utils.sleep(2000);
  await page.click('a[href*="?nso=&page=2"');
  await utils.sleep(1000);
};

let pageNum = 1;
const searchTargetItem: any = async (page: Page) => {
  await page.waitForSelector(".sc_page_inner");
  for await (let i of Array(10).keys()) {
    console.log("wheel , ", i);
    await page.mouse.wheel({ deltaY: 150 * i });
    await utils.sleep(200);
  }
  if (pageNum > 10) {
    return null;
  }
  console.log("before click");
  const res = await page.$(`a[href*="${LocalConfig.url}"]`);
  console.log("res : ", res);
  if (res) {
    await page.click(`a[href*="${LocalConfig.url}"]`);
    pageNum = 3;
    return page;
  }
  await utils.sleep(500);
  const pageItem = await page.$(`a[href*="?nso=&page=${pageNum}"]`);
  console.log("pageItem : ", pageItem);
  await pageItem?.click();
  await utils.sleep(1000);
  pageNum++;
  return await searchTargetItem(page);
};

const adventure = async (page: Page, config: NaverWebsiteConfig) => {
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

export const process = async (localConfig: NaverWebsiteConfig) => {
  LocalConfig = localConfig;
  pageNum = 3;
  console.log("utils : ", utils);
  const browser = await utils.getBrowser(localConfig);
  try {
    let page = ((await browser.pages()) as any)[0];

    page = await gotoNaverMain(page);
    page = await searchKeyword(page);
    await utils.sleep(2000);
    page = await click2Page(page);
    let pages = await browser.pages();
    page = pages[pages.length - 1];
    const v = await searchTargetItem(page);
    if (v) {
      page = v;
    } else {
      throw new Error("not found");
    }
    await utils.sleep(3000);
    pages = await browser.pages();
    page = pages[pages.length - 1];
    await utils.sleep(3000);
    await adventure(page, localConfig);

    await utils.sleep(5000);
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};
