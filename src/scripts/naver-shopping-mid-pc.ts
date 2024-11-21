import puppeteer from "puppeteer-core";
import { Page } from "puppeteer-core";
import config from "../config";
import utils from "../utils";
import { Config } from "..";
import NaverMacroUtil from "../utils/naver";

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
const searchTargetItem: any = async (
  page: Page,
  waitTimeList: [number, number][],
  scrollTimeList: [number, number, number, number][] // scroll 횟수, 휠 양(250), 대기랜덤시작,대기랜덤종료
) => {
  console.log("pageNum : ", pageNum);
  await page.waitForSelector(`a[data-shp-contents-id="${pageNum}"]`);
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[4])); // 4 : 스크롤 전 대기
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
  console.log("before click");
  if (
    await NaverMacroUtil.pc.clickShoppingTargetItem(page, config.SEARCH_MID)
  ) {
    pageNum = 1;
    return page;
  }

  await utils.sleep(utils.getRandomSecTuple(waitTimeList[5])); // 5 : 상품 검색 실패 후 대기
  if (jumpList.length > 0 && jumpIndex < jumpList.length) {
    pageNum = parseInt(jumpList[jumpIndex]);
    jumpIndex++;
  }
  if (jumpList.length === 0) {
    pageNum++;
  }
  await NaverMacroUtil.pc.clickShoppingNavigatition(page, pageNum);
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[6])); // 6 : 아래 숫자로 다음 페이지 이동 클릭

  return await searchTargetItem(page, waitTimeList, scrollTimeList);
};

const adventure = async (page: Page, config: NaverShippingMidConfig) => {
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[7])); // 7 : 검색 성공 후 대기 시간
  for await (let i of Array(config.scrollTimeList[1][0]).keys()) {
    await page.mouse.wheel({ deltaY: config.scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[1].slice(2) as [number, number]
      )
    );
  }
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[8])); // 8 : 스크롤 한번 한 후 대기시간
  for await (let i of Array(config.scrollTimeList[2][0]).keys()) {
    // 스크롤 한번 한 후 스크롤
    await page.mouse.wheel({ deltaY: config.scrollTimeList[2][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[2].slice(2) as [number, number]
      )
    );
  }
  // await utils.sleep(utils.getRandomSec(5, 10));
  // for await (let i of Array(10).keys()) {
  //   console.log("wheel , ", i);
  //   const randomSec = utils.getRandomSec(1, 2);

  //   await page.mouse.wheel({ deltaY: -(randomSec / 3) * i });
  //   await utils.sleep(randomSec);

  console.log("adventure finish");
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[8])); // 8 : 모든 동작 완료 후 대기시간
  return page;
};

type NaverShippingMidConfig = {
  keyword: string;
  mid: string;
  jumpPage?: string;
} & Config;

export const process = async (localConfig: NaverShippingMidConfig) => {
  config.SEARCH_KEYWORD = localConfig.keyword;
  config.SEARCH_MID = localConfig.mid;
  const waitTimeList = localConfig.waitTimeList;
  const startTimeMs = performance.now() / 1000;
  if (localConfig.jumpPage) {
    jumpList = localConfig.jumpPage.split("_");
    jumpIndex = 0;
  }
  pageNum = 1;
  console.log("run");
  const browser = await utils.getBrowser(localConfig);

  try {
    let page = ((await browser.pages()) as any)[0];

    await utils.sleep(utils.getRandomSecTuple(waitTimeList[0])); // 0 : 메크로 시작전 대기
    page = await NaverMacroUtil.pc.goToNaverMain(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[1])); // 1 : 메인 페이지 이동후 대기
    page = await NaverMacroUtil.pc.searchKeyword(page, localConfig.keyword);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[2])); // 2 : 키워드 검색 후 대기
    page = await clickShoppingMore(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[3])); // 3 : 쇼핑더보기   후 대기 (최소 5초 이상)
    let pages = await browser.pages();
    page = pages[pages.length - 1];
    const v = await searchTargetItem(
      page,
      waitTimeList,
      localConfig.scrollTimeList
    );
    if (v) {
      page = v;
    } else {
      throw new Error("not found");
    }

    await utils.sleep(5000);
    pages = await browser.pages();
    page = pages[pages.length - 1];
    console.log("pages count : ", pages);
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

// const t_config = {
//   keyword: "전선몰딩",
//   mid: "82219672900",
//   jumpPage: "1_2_3_4_5_6_7_8_9_10",
//   browserPath:
//     "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
//   // edgePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//   startWaitSecStart: 3,
//   startWaitSecEnd: 5,
//   scrollCount: 5,
//   macroMessageKey: "naver-shopping-mid",
//   macroKind: "naver-shopping-compare",
//   repeat: 10,
//   isView: true,
//   networkRefreshCount: 10,
//   proxyChangeTime: 10,
//   waitTimeList: [
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//   ],
//   scrollTimeList: [
//     [20, 250, 250, 500],
//     [10, 250, 1000, 1500],
//   ],
// };
// // const proxySetter = new ProxySetter({
// //   proxyChangeTime: t_config.proxyChangeTime,
// // });
// process({ ...t_config /*proxy: proxySetter.getProxy()*/ } as any);

// const t_config = {
//   keyword: "탄소매트",
//   mid: "88314476325",
//   // jumpPage: "1_2_3_4_5_6_7_8_9_10",
//   browserPath:
//     "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
//   // edgePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//   startWaitSecStart: 3,
//   startWaitSecEnd: 5,
//   scrollCount: 5,
//   macroMessageKey: "naver-shopping-mid",
//   macroKind: "naver-shopping-compare",
//   repeat: 10,
//   isView: true,
//   networkRefreshCount: 10,
//   // proxyChangeTime: 10,
//   waitTimeList: [
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//     [1000, 1500],
//   ],
//   scrollTimeList: [
//     [10, 250, 250, 500],
//     [10, 250, 1000, 1500],
//   ],
// };

// process({ ...t_config /*proxy: proxySetter.getProxy()*/ } as any);
