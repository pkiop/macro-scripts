import { Page } from "puppeteer-core";
import config from "../config";
import utils from "../utils";
import { Config } from "..";
import NaverMacroUtil from "../utils/naver";

const gotoNaverMain = async (page: Page) => {
  await page.goto(config.NAVER_MAIN_URL);
  return page;
};

const searchKeyword = async (page: Page) => {
  await page.waitForSelector("#query");
  await page.type("#query", config.SEARCH_KEYWORD);
  await page.click("#search-btn");
  return page;
};

const clickShoppingMore = async (page: Page) => {
  await page.waitForSelector(
    `a[href*="https://search.shopping.naver.com"].group_more`
  );
  await page.click(`a[href*="https://search.shopping.naver.com"].group_more`);
  return page;
};

let pageNum = 1;
let jumpList: string[] = [];
let jumpIndex = 0;
const searchTargetItem = async (
  page: Page,
  waitTimeList: [number, number][],
  scrollTimeList: [number, number, number, number][], // scroll 횟수, 휠 양(250), 대기랜덤시작,대기랜덤종료
  mid: string
) => {
  await page.waitForSelector(`a[data-shp-contents-id="${pageNum}"]`);
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[4])); //4. 스크롤 전 대기
  for await (let i of Array(scrollTimeList[0][0]).keys()) {
    // scroll 0 : 페이지 로딩 완료후 스크롤
    await page.mouse.wheel({ deltaY: scrollTimeList[0][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[0].slice(2) as [number, number])
    );
  }
  if (pageNum > config.MAX_SEARCH_PAGE) {
    return null;
  }
  if (jumpList.length > 0 && jumpIndex >= jumpList.length) {
    return null;
  }
  console.log("before click in first mid");
  const res = await page.$(`a[data-i="${config.SEARCH_MID}"]`);
  console.log("res : first", res);
  if (res) {
    await page.click(`a[data-i="${config.SEARCH_MID}"]`);
    pageNum = 1;
    return page;
  }
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[5])); //5. 상품 검색 실패 후 대기
  if (jumpList.length > 0 && jumpIndex < jumpList.length) {
    pageNum = parseInt(jumpList[jumpIndex]);
    jumpIndex++;
  }
  if (jumpList.length === 0) {
    pageNum++;
  }
  await NaverMacroUtil.pc.clickShoppingNavigatition(page, pageNum);
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[6])); //6. 아래 숫자로 다음 페이지 이동

  return await searchTargetItem(page, waitTimeList, scrollTimeList, mid);
};

let compareConfigPageCounter = {
  pageNum: 1,
  jumpIndex: 0,
};
const clickTargetProductInPriceCompare: any = async (
  page: Page,
  localConfig: NaverShoppingComparePcConfig
) => {
  await page.waitForSelector(`ul[class*="productList_list_seller"]`);
  const waitTimeList = localConfig.waitTimeList;
  const scrollTimeList = localConfig.scrollTimeList;
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[7])); //7. 상품 들어가서 나온 상품 비교 스크롤 전 대기
  for await (let i of Array(scrollTimeList[1][0]).keys()) {
    // scroll 1 : 페이지 로딩 완료후 스크롤
    await page.mouse.wheel({ deltaY: scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[1].slice(2) as [number, number])
    );
  }
  if (compareConfigPageCounter.pageNum > config.MAX_SEARCH_PAGE) {
    return null;
  }
  if (
    jumpList.length > 0 &&
    compareConfigPageCounter.jumpIndex >= jumpList.length
  ) {
    return null;
  }
  console.log("before click");
  const res = (
    await page.$$(
      `ul[class*="productList_list_seller"] a[data-i="${localConfig.compareMid}"]`
    )
  )?.[1];
  console.log("res : ", res);
  if (res) {
    await utils.sleep(1000);
    console.log("before click real");
    await res.click();
    console.log("after click real");
    // await page.click(
    //   `ul[class*="productList_list_seller"] a[data-i="${localConfig.compareMid}":nth-child(2)]`

    // );
    console.log("click success");
    compareConfigPageCounter.pageNum = 1;
    return page;
  }
  await utils.sleep(1000);
  if (
    jumpList.length > 0 &&
    compareConfigPageCounter.jumpIndex < jumpList.length
  ) {
    compareConfigPageCounter.pageNum = parseInt(
      jumpList[compareConfigPageCounter.jumpIndex]
    );
    compareConfigPageCounter.jumpIndex++;
  }
  const pagination_nextitem = await page.$(
    `#section_review a[data-shp-contents-id="${compareConfigPageCounter.pageNum}"]`
  );
  console.log("compare config pageItem : ", compareConfigPageCounter);
  console.log("pageItem : ", pagination_nextitem);
  await pagination_nextitem?.click();
  await utils.sleep(1000);

  if (jumpList.length === 0) {
    compareConfigPageCounter.pageNum++;
  }
  return await clickTargetProductInPriceCompare(page, localConfig);
};

const clickPriceCompare = async (page: Page) => {
  await page.click(".seller_filter_area > ul > li:nth-child(2)");
  return page;
};

const adventure = async (page: Page, config: NaverShoppingComparePcConfig) => {
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[8])); // 8 : 검색 성공 후 대기 시간
  // 2, 검색 성공 후 스크롤
  for await (let i of Array(config.scrollTimeList[2][0]).keys()) {
    await page.mouse.wheel({ deltaY: config.scrollTimeList[2][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[2].slice(2) as [number, number]
      )
    );
  }

  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[9])); // 9 : 검색성공 스크롤 후 대기
  // await utils.sleep(utils.getRandomSec(5, 10));
  // for await (let i of Array(10).keys()) {
  //   console.log("wheel , ", i);
  //   const randomSec = utils.getRandomSec(1, 2);

  //   await page.mouse.wheel({ deltaY: -(randomSec / 3) * i });
  //   await utils.sleep(randomSec);

  console.log("adventure finish");
  return page;
};

type NaverShoppingComparePcConfig = {
  keyword: string;
  mid: string;
  compareMid: string;
  jumpPage?: string;
} & Config;

export const process = async (localConfig: NaverShoppingComparePcConfig) => {
  config.SEARCH_KEYWORD = localConfig.keyword;
  config.SEARCH_MID = localConfig.mid;
  if (localConfig.jumpPage) {
    jumpList = localConfig.jumpPage.split("_");
    jumpIndex = 0;
    compareConfigPageCounter.jumpIndex = 0;
  }
  pageNum = 1;
  compareConfigPageCounter.pageNum = 1;
  const waitTimeList = localConfig.waitTimeList;

  const browser = await utils.getBrowser(localConfig);
  try {
    let page = ((await browser.pages()) as any)[0];

    page = await gotoNaverMain(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[0])); // 0 : 네이버 메인 접속후 대기
    page = await searchKeyword(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[1])); // 1 : 키워드 검색 후 대기
    page = await clickShoppingMore(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[2])); // 2 : 쇼핑더보기 후  대기 (최소 5000ms)
    let pages = await browser.pages();
    page = pages[pages.length - 1];

    page = await clickPriceCompare(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[3])); // 3 : 가격 비교 클릭 후  대기
    const v = await searchTargetItem(
      page,
      waitTimeList,
      localConfig.scrollTimeList,
      localConfig.mid
    );
    if (v) {
      page = v;
    } else {
      throw new Error("not found");
    }
    await utils.sleep(2000);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[6])); //6. 아래 숫자로 다음 페이지 이동
    pages = await browser.pages();
    page = pages[pages.length - 1];
    await utils.sleep(2000);

    await clickTargetProductInPriceCompare(page, localConfig);
    await utils.sleep(2000);
    pages = await browser.pages();
    page = pages[pages.length - 1];
    await adventure(page, localConfig);

    await utils.sleep(5000);
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};

// process({
//   keyword: "여성청결제",
//   mid: "8439983476",
//   compareMid: "9240048684",
//   edgePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//   startWaitSecStart: 3,
//   startWaitSecEnd: 5,
//   scrollCount: 5,
//   macroMessageKey: "naver-shopping-mid",
//   macroKind: "naver-shopping-compare",
//   repeat: 10,
//   isView: true,
//   networkRefreshCount: 10,
// });
