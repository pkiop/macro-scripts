import { Page } from "puppeteer-core";
import config from "../config";
import utils from "../utils";
import { Config } from "..";
import NaverMacroUtil from "../utils/naver";

type NaverShoppingMidUsingTab = {
  keyword: string;
  mid: string;
  jumpPage?: string;
} & Config;

export const process = async (localConfig: NaverShoppingMidUsingTab) => {
  console.log("네이버 모바일 탭 : ", localConfig);
  config.SEARCH_KEYWORD = localConfig.keyword;
  config.SEARCH_MID = localConfig.mid;
  const waitTimeList = localConfig.waitTimeList;
  if (localConfig.jumpPage) {
    jumpList = localConfig.jumpPage.split("_");
    jumpIndex = 0;
  }
  pageNum = 1;
  console.log("run");
  const browser = await utils.getBrowser(localConfig, false);

  try {
    await utils.sleep(1000);
    let page = ((await browser.pages()) as any)[0];
    console.log("page  :", page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[0])); // 0 : 메크로 시작전 대기
    page = await NaverMacroUtil.pc.goToNaverMain(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[1])); // 1 : 메인 페이지 이동후 대기
    page = await NaverMacroUtil.pc.clickShoppingTab(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[2])); // 2 : 쇼핑 텝 클릭 후 대기
    let pages;
    pages = await browser.pages();
    page = pages[pages.length - 1];
    page = await NaverMacroUtil.pc.shoppingSearchKeyword(
      page,
      localConfig.keyword
    );
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[3])); // 3 : 검색 후 대기
    pages = await browser.pages();
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
    await adventure(page, localConfig);

    await utils.sleep(5000);
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};

let pageNum = 1;
let jumpList: string[] = [];
let jumpIndex = 0;
const searchTargetItem: any = async (
  page: Page,
  waitTimeList: [number, number][],
  scrollTimeList: [number, number, number, number][] // scroll 횟수, 휠 양(250), 대기랜덤시작,대기랜덤종료
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

const adventure = async (page: Page, config: NaverShoppingMidUsingTab) => {
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[7])); // 7 : 검색 성공 후 대기 시간
  for await (let i of Array(config.scrollTimeList[1][0]).keys()) {
    await page.mouse.wheel({ deltaY: config.scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[1].slice(2) as [number, number]
      )
    );
  }
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[8])); // 8 : 검색 성공 후 대기 시간
  for await (let i of Array(config.scrollTimeList[2][0]).keys()) {
    await page.mouse.wheel({ deltaY: config.scrollTimeList[2][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[2].slice(2) as [number, number]
      )
    );
  }

  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[9])); // 9 : 모든 동작 완료 후 대기시간
  return page;
};

// // 9page
// const t_config = {
//   keyword: "토끼인형",
//   mid: "82998422481",
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
//     [20, 250, 250, 500],
//     [10, 250, 1000, 1500],
//   ],
// };
// // const proxySetter = new ProxySetter({
// //   proxyChangeTime: t_config.proxyChangeTime,
// // });
// process({ ...t_config /*proxy: proxySetter.getProxy()*/ } as any);
