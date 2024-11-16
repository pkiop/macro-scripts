import { Page } from "puppeteer-core";
import utils from ".";

const scroll = async (page: Page, scrollCount: number) => {
  console.log("scrollCount : ", scrollCount);
  for await (let i of Array(scrollCount).keys()) {
    console.log("wheel , ", i);
    await page.mouse.wheel({ deltaY: 250 * i });
    console.log("wheel success");
    await utils.sleep(200);
  }
};

const macroUtils = {
  scroll,
};
export default macroUtils;
