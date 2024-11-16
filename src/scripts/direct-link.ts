import puppeteer from "puppeteer-core";
import { Page } from "puppeteer-core";
import utils from "../utils";
import { Config } from "..";

const gotoNaverMain = async (page: Page, directUrl: string) => {
  await page.goto(directUrl);
  return page;
};

const adventure = async (page: Page, config: DirectLinkConfig) => {
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[2])); //2. 스크롤 전 대기
  for await (let i of Array(config.scrollTimeList[0][0]).keys()) {
    // scroll 0 : 페이지 로딩 완료후 스크롤
    await page.mouse.wheel({ deltaY: config.scrollTimeList[0][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[0].slice(2) as [number, number]
      )
    );
  }
  await utils.sleep(utils.getRandomSecTuple(config.waitTimeList[3])); //3. 스크롤 한번 한 후 대기
  for await (let i of Array(config.scrollTimeList[1][0]).keys()) {
    // scroll 1 : 스크롤 한번 한 후 스크롤
    await page.mouse.wheel({ deltaY: config.scrollTimeList[1][1] * i });
    await utils.sleep(
      utils.getRandomSecTuple(
        config.scrollTimeList[1].slice(2) as [number, number]
      )
    );
  }

  console.log("adventure finish");
  return page;
};

type DirectLinkConfig = {
  link: string;
} & Config;

export const process = async (localConfig: DirectLinkConfig) => {
  console.log("direct link process start");
  console.log("localConfig : ", localConfig);
  const browser = await utils.getBrowser(
    localConfig,
    localConfig.macroName === "direct-link-mobile"
  );

  try {
    let page = ((await browser.pages()) as any)[0];

    await utils.sleep(utils.getRandomSecTuple(localConfig.waitTimeList[0])); // 0 : 메크로 시작전 대기
    page = await gotoNaverMain(page, localConfig.link);
    await utils.sleep(utils.getRandomSecTuple(localConfig.waitTimeList[1])); // 1 : 링크 접속 후 대기
    await adventure(page, localConfig);
    await utils.sleep(utils.getRandomSecTuple(localConfig.waitTimeList[4])); // 4 : 메크로 완료 후
  } catch (e) {
    console.log("error : ", e);
    throw new Error("MACRO_ERROR");
  } finally {
    await browser.close();
  }
};
