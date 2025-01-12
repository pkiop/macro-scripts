import puppeteer from "puppeteer";
import { Page } from "puppeteer";
import config from "../config";
import utils from "../utils";
import { Config } from "..";
import NaverMacroUtil from "../utils/naver";

const adventure = async (page: Page, config: NaverShippingMidConfig) => {
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[5])); // 7 : 검색 성공 후 대기 시간
  for await (let i of Array(config.scrollTimeList[1][0]).keys()) {
    await page.mouse.wheel({ deltaY: config.scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[1].slice(2) as [number, number]
      )
    );
  }
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[6])); // 7 : 검색 성공 후 대기 시간
  for await (let i of Array(config.scrollTimeList[2][0]).keys()) {
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

  console.log("run");
  const browser = await utils.getBrowser(localConfig);

  try {
    await utils.sleep(1000);
    let page = ((await browser.pages()) as any)[0];

    await utils.sleep(utils.getRandomSecTuple(waitTimeList[0])); // 0 : 메크로 시작전 대기
    page = await NaverMacroUtil.pc.goToNaverMain(page);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[1])); // 1 : 메인 페이지 이동후 대기
    page = await NaverMacroUtil.pc.searchKeyword(page, localConfig.keyword);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[2])); // 2 : 키워드 검색 후 대기
    for await (let i of Array(localConfig.scrollTimeList[0][0]).keys()) {
      // 0 : 페이지 로딩 완료후 스크롤
      await page.mouse.wheel({ deltaY: localConfig.scrollTimeList[0][1] * i });
      await utils.sleep(
        utils.getRandomSecTuple(
          localConfig.scrollTimeList[0].slice(2) as [number, number]
        )
      );
    }
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[3])); // 3 : 스크롤 후 대기
    await page.locator(`a[href*="nv_mid=${localConfig.mid}"]`).click();

    await utils.sleep(utils.getRandomSecTuple(waitTimeList[4])); // 2 : 키워드 검색 후 대기
    let pages = await browser.pages();
    page = pages[pages.length - 1];
    await adventure(page, localConfig);
    await utils.sleep(utils.getRandomSecTuple(waitTimeList[7])); // 7 : 모든 동작 완료 후 대기
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};

// const t_config = {
//   keyword: "전선몰딩",
//   mid: "86704648237",
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
//   ],
//   scrollTimeList: [
//     [3, 250, 250, 500],
//     [10, 250, 1000, 1500],
//   ],
// };
// // const proxySetter = new ProxySetter({
// //   proxyChangeTime: t_config.proxyChangeTime,
// // });
// process({ ...t_config /*proxy: proxySetter.getProxy()*/ } as any);
