import { process as naverShoppingMidPcProcess } from "./scripts/naver-shopping-mid-pc";
import { process as naverShoppingMidMobileProcess } from "./scripts/naver-shopping-mid-mobile";
import { process as naverShoppingCompareProcess } from "./scripts/naver-shopping-compare-pc";
import { process as directLinkProcess } from "./scripts/direct-link";
import { process as naverWebsiteProcess } from "./scripts/naver-website";
import { process as naverWebsiteJustSearchProcess } from "./scripts/naver-website-just-search";
import { process as NaverPlaceMobileProcess } from "./scripts/naver-place-mobile";
import { process as NaverPlacePcProcess } from "./scripts/naver-place-pc";
import { process as NaverShoppingMidNoClickShoppingMoreClickMobile } from "./scripts/naver-shopping-mid-no-click-shopping-more-mobile";
import { process as NaverShoppingMidNoClickShoppingMoreClickPc } from "./scripts/naver-shopping-mid-no-click-shopping-more-pc";
import { process as NaverShoppingMidMobileUsingTab } from "./scripts/naver-shopping-mid-mobile-using-tab";
import { process as NaverShoppingMidPcUsingTab } from "./scripts/naver-shopping-mid-pc-using-tab";
import { process as NaverShoppingDirectLinkMidPc } from "./scripts/naver-shopping-direct-link-mid-pc";
import { process as NaverShoppingDirectLinkMidMobile } from "./scripts/naver-shopping-direct-link-mid-mobile";
import { process as NaverShoppingFindUrlAndDirectlinkPc } from "./scripts/naver-shopping-find-url-and-directlink-pc";
import { process as NaverShoppingFindUrlAndDirectlinkMobile } from "./scripts/naver-shopping-find-url-and-directlink-mobile";
// import { process as NaverShoppingCompareMobile } from "./scripts/naver-shopping-compare-mobile";
import { process as NaverShoppingComparePc } from "./scripts/naver-shopping-compare-pc";
import { process as CoupangNormal } from "./scripts/coupang-normal";

import ProxySetter from "./utils/proxy";
import { parentPort, workerData } from "worker_threads";

export type Config = {
  startWaitSecStart: number;
  startWaitSecEnd: number;
  scrollCount: number;
  macroMessageKey: string;
  macroName:
    | "naver-shopping-mid-pc"
    | "naver-shopping-mid-mobile"
    | "naver-shopping-compare-mobile"
    | "naver-shopping-compare-pc"
    | "direct-link"
    | "direct-link-mobile"
    | "naver-website"
    | "naver-website-just-search"
    | "naver-place-mobile"
    | "naver-place-pc"
    | "naver-shopping-mid-mobile-using-tab"
    | "naver-shopping-mid-pc-using-tab"
    | "naver-shopping-mid-no-click-shopping-more-mobile"
    | "naver-shopping-mid-no-click-shopping-more-pc"
    | "naver-shopping-find-url-and-directlink-pc"
    | "naver-shopping-find-url-and-directlink-mobile"
    | "naver-shopping-direct-link-mid-pc"
    | "naver-shopping-direct-link-mid-mobile"
    | "coupang-normal";
  browserPath: string;
  isView: boolean;
  networkRefreshCount: number;
  networkChangeWaitTime: number;
  proxyChangeTime: number;
  proxy?: string;
  waitTimeList: [number, number][];
  scrollTimeList: [number, number, number, number][];
  isMobile?: boolean; //  for direct-link
  keyword?: string;
  link?: string;
  mid?: string;
  compareMid?: string;
  pcId: string;
  timeout: number;
};

export const macroRun = async (config: Config) => {
  console.log("input config : ", config);
  const proxySetter =
    config.proxyChangeTime > 0
      ? new ProxySetter({
          proxyChangeTime: config.proxyChangeTime,
        })
      : null;
  if (proxySetter) {
    config.proxy = proxySetter.getProxy();
    console.log("config.proxy : ", config.proxy);
  }

  try {
    switch (config.macroName) {
      case "naver-shopping-mid-pc":
        await naverShoppingMidPcProcess(config as any);
        break;
      case "naver-shopping-mid-mobile":
        await naverShoppingMidMobileProcess(config as any);
        break;
      case "direct-link":
      case "direct-link-mobile":
        await directLinkProcess(config as any);
        break;
      case "naver-shopping-direct-link-mid-pc":
        await NaverShoppingDirectLinkMidPc(config as any);
        break;
      case "naver-shopping-direct-link-mid-mobile":
        await NaverShoppingDirectLinkMidMobile(config as any);
        break;
      case "naver-shopping-mid-mobile-using-tab":
        await NaverShoppingMidMobileUsingTab(config as any);
        break;
      case "naver-shopping-mid-pc-using-tab":
        await NaverShoppingMidPcUsingTab(config as any);
        break;
      case "naver-shopping-mid-no-click-shopping-more-mobile":
        await NaverShoppingMidNoClickShoppingMoreClickMobile(config as any);
        break;
      case "naver-shopping-mid-no-click-shopping-more-pc":
        await NaverShoppingMidNoClickShoppingMoreClickPc(config as any);
        break;
      // case "naver-shopping-compare-mobile":
      //   await NaverShoppingCompareMobile(config as any);
      //   break;
      case "naver-shopping-compare-pc":
        await NaverShoppingComparePc(config as any);
        break;
      case "naver-place-pc":
        await NaverPlacePcProcess(config as any);
        break;
      case "naver-place-mobile":
        await NaverPlaceMobileProcess(config as any);
        break;
      case "naver-shopping-find-url-and-directlink-pc":
        await NaverShoppingFindUrlAndDirectlinkPc(config as any);
        break;
      case "naver-shopping-find-url-and-directlink-mobile":
        await NaverShoppingFindUrlAndDirectlinkMobile(config as any);
        break;
      case "coupang-normal":
        await CoupangNormal(config as any);
        break;
      default:
        console.log("config macroName 없음 : ", config.macroName);
        break;
    }
  } catch (e) {
    console.log("error in macro main : ", e);
    throw e;
  }
};

const main = async () => {
  const { task } = workerData;
  try {
    await macroRun(task);
    parentPort?.postMessage({ message: "success" });
  } catch (e) {
    console.log("error in main : ", e);
    parentPort?.postMessage({ message: "failed", error: JSON.stringify(e) });
  } finally {
    parentPort?.close();
  }
};

const test = async () => {
  // await macroRun({
  //   keyword: "여성청결제",
  //   mid: "8439983476",
  //   browserPath:
  //     "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  //   startWaitSecStart: 3,
  //   startWaitSecEnd: 5,
  //   scrollCount: 5,
  //   macroMessageKey: "naver-shopping-mid",
  //   macroName: "naver-shopping-find-url-and-directlink-mobile",
  //   networkRefreshCount: 10,
  //   waitTimeList: [
  //     [500, 501],
  //     [500, 501],
  //     [5000, 5001],
  //     [2000, 2001],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //   ],
  //   scrollTimeList: [
  //     [25, 250, 250, 251],
  //     [25, 250, 250, 251],
  //     [25, 250, 250, 251],
  //   ],
  // } as any);
  // await macroRun({
  //   keyword: "여성청결제",
  //   mid: "8439983476",
  //   compareMid: "9240048684",
  //   browserPath:
  //     "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  //   startWaitSecStart: 3,
  //   startWaitSecEnd: 5,
  //   scrollCount: 5,
  //   macroMessageKey: "naver-shopping-mid",
  //   macroName: "naver-shopping-compare-pc",
  //   networkRefreshCount: 10,
  // } as any);
  // await macroRun({
  //   keyword: "여성청결제",
  //   mid: "8439983476",
  //   compareMid: "9240048684",
  //   browserPath:
  //     "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  //   startWaitSecStart: 3,
  //   startWaitSecEnd: 5,
  //   scrollCount: 5,
  //   macroMessageKey: "naver-shopping-mid",
  //   macroName: "naver-shopping-compare-pc",
  //   networkRefreshCount: 10,
  //   waitTimeList: [
  //     [500, 501],
  //     [500, 501],
  //     [5000, 5001],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //     [500, 501],
  //   ],
  //   scrollTimeList: [
  //     [3, 250, 250, 251],
  //     [3, 250, 250, 251],
  //     [3, 250, 250, 251],
  //   ],
  // } as any);
  await macroRun({
    keyword: "레트로 게임기",
    // keyword: "드림어워드 골프트로피",
    // keyword: "삼성 무선충전기",

    mid: "18747806050",
    // mid: "84195300040",
    compareMid: "87026070117",
    browserPath:
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    startWaitSecStart: 3,
    startWaitSecEnd: 5,
    scrollCount: 5,
    macroMessageKey: "naver-shopping-compare-pc",
    macroName: "coupang-normal",
    networkRefreshCount: 10,
    waitTimeList: [
      [500, 501],
      [500, 501],
      [5500, 5501],
      [500, 501],
      [500, 501],
      [500, 501],
      [500, 501],
      [500, 501],
      [500, 501],
      [500, 501],
      [500, 501],
      [500, 501],
      [5000, 5001],
      [10000, 11000],
      [10000, 11000],
      [5000, 5010],
    ],
    scrollTimeList: [
      [11, 250, 400, 500],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
      [3, 250, 250, 251],
    ],
  } as any);
};

if (true) {
  test();
} else {
  main();
}
