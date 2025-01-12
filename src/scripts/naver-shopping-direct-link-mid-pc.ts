import { Page } from "puppeteer";
import utils from "../utils";
import { Config } from "..";
import NaverMacroUtil from "../utils/naver";

type NaverShoppingMidUsingLink = {
  keyword: string;
  link: string;
  jumpPage?: string;
} & Config;

export const process = async (localConfig: NaverShoppingMidUsingLink) => {
  console.log("네이버 모바일 탭 : ", localConfig);
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
    await page.goto(localConfig.link);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[1])); // 1 : 링크 이동 후 대기
    let pages = await browser.pages();
    page = pages[pages.length - 1];
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
    await utils.sleep(5000);
    pages = await browser.pages();
    page = pages[pages.length - 1];
    console.log("pages count : ", pages);
    await adventure(page, localConfig);

    await utils.sleep(1000);
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
  scrollTimeList: [number, number, number, number][], // scroll 횟수, 휠 양(250), 대기랜덤시작,대기랜덤종료
  mid: number
) => {
  await page.waitForSelector(`form[name="search"]`);
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[2])); //2. 스크롤 전 대기
  for await (let i of Array(scrollTimeList[0][0]).keys()) {
    // scroll 0 : 페이지 로딩 완료후 스크롤
    await page.mouse.wheel({ deltaY: scrollTimeList[0][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(scrollTimeList[0].slice(2) as [number, number])
    );
  }
  const MAX_SEARCH_PAGE = 25;
  if (pageNum > MAX_SEARCH_PAGE) {
    return null;
  }
  if (jumpList.length > 0 && jumpIndex >= jumpList.length) {
    return null;
  }
  console.log("before click");
  if (await NaverMacroUtil.pc.clickShoppingTargetItem(page, String(mid))) {
    pageNum = 1;
    return page;
  }
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[3])); // 3 : 상품 검색 실패 후 대기
  if (jumpList.length > 0 && jumpIndex < jumpList.length) {
    pageNum = parseInt(jumpList[jumpIndex]);
    jumpIndex++;
  }
  if (jumpList.length === 0) {
    pageNum++;
  }
  await NaverMacroUtil.pc.clickShoppingNavigatition(page, pageNum);
  await utils.sleep(utils.getRandomSecTuple(waitTimeList[4])); // 4 : 아래 숫자로 다음 페이지 이동 클릭

  return await searchTargetItem(page, waitTimeList, scrollTimeList, mid);
};

const adventure = async (page: Page, config: NaverShoppingMidUsingLink) => {
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[5])); // 5 : 검색 성공 후 대기 시간
  for await (let i of Array(config.scrollTimeList[1][0]).keys()) {
    await page.mouse.wheel({ deltaY: config.scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[1].slice(2) as [number, number]
      )
    );
  }
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[6])); // 6 : 검색 성공 후 대기 시간
  for await (let i of Array(config.scrollTimeList[2][0]).keys()) {
    await page.mouse.wheel({ deltaY: config.scrollTimeList[2][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[2].slice(2) as [number, number]
      )
    );
  }

  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[7])); // 7 : 모든 동작 완료 후 대기시간
  return page;
};

// 9page
// const t_config = {
//   link: "https://search.shopping.naver.com/search/all?query=1%EC%9D%B8%EC%9A%A9%ED%83%84%EC%86%8C%EB%A7%A4%ED%8A%B8&catld=50009160&mall=5668135&maxprice=89000&minPrice=89000",
//   mid: "87230249644",
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
