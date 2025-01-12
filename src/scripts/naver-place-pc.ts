import { Page } from "puppeteer";
import utils from "../utils";
import { Config } from "..";
import logger from "../utils/logger";

type NaverPlacePcConfig = {
  keyword: string;
  mid: number;
} & Config;

let LocalConfig: NaverPlacePcConfig;

const gotoNaverMain = async (page: Page) => {
  await page.goto("https://www.naver.com");
  return page;
};

const searchKeyword = async (page: Page) => {
  await page.waitForSelector("#query");
  await page.type("#query", LocalConfig.keyword);
  await page.keyboard.down("Enter");
  await page.waitForNavigation();
  return page;
};

let pageNum = 1;
const searchTargetItem: any = async (page: Page) => {
  try {
    await page.click(`[data-cbm-doc-id="${LocalConfig.mid}"] a`);
    console.log("click success");
  } catch (e) {
    console.log("error : ");
    await page.click(`div#_title span`);
  }

  return page;
};

const iframeHandlePage = async (
  page: Page,
  waitTimeList: [number, number][],
  scrollTimeList: [number, number, number, number][]
) => {
  const iframeHandle = await page.$("#entryIframe");
  const iframe = await iframeHandle?.contentFrame();
  const photoE = await iframe?.$(
    `.place_fixed_maintab .flicking-camera a[href*="photo"]`
  );
  console.log("photoE : ", photoE);
  await photoE?.click();
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[3])); // 3 : 사진 클릭 후 대기 (10000초)
  const reviewE = await iframe?.$(
    `.place_fixed_maintab .flicking-camera a[href*="review"]`
  );
  console.log("photoE : ", photoE);
  await reviewE?.click();
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[4])); // 4 : 리뷰 클릭 후 대기 시간 ( 10000)
  // 0, 리뷰 스크롤
  for await (let i of Array(scrollTimeList[0][0]).keys()) {
    await page.mouse.wheel({ deltaY: scrollTimeList[0][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[0].slice(2) as [number, number])
    );
  }
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[5])); // 5 : 리뷰 클릭 후 대기 시간 ( 10000)
  // 0, 리뷰 스크롤
  for await (let i of Array(scrollTimeList[1][0]).keys()) {
    await page.mouse.wheel({ deltaY: scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[1].slice(2) as [number, number])
    );
  }

  await utils.sleep(utils.getRandomSecTuple(waitTimeList[6])); // 6 : 리뷰 스크롤 후 대기
};
export const process = async (localConfig: NaverPlacePcConfig) => {
  LocalConfig = localConfig;
  pageNum = 3;
  const waitTimeList = localConfig.waitTimeList;

  const browser = await utils.getBrowser(localConfig);

  try {
    let page = ((await browser.pages()) as any)[0];

    localConfig.waitTimeList;
    page = await gotoNaverMain(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[0])); // 0 : 네이버 메인 접속후 대기
    page = await searchKeyword(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[1])); // 1 : 키워드 검색 후 대기

    page = await searchTargetItem(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[2])); // 2 : 검색어 타겟 후 대기
    let pages = await browser.pages();

    page = pages[pages.length - 1];
    await iframeHandlePage(page, waitTimeList, localConfig.scrollTimeList);
  } catch (e) {
    logger.error("PLACE_PC_ERROR: ", JSON.stringify(e));
    throw new Error("MACRO ERROR");
  } finally {
    await browser.close();
  }
};
