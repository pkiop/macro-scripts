import puppeteer from "puppeteer";
import { parentPort } from "worker_threads";

import * as proxyChain from "proxy-chain";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomSec = (minSec: number, maxSec: number) => {
  const randomSec = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
  return randomSec * 1000;
};

const getRandomMilliSecTuple = ([minSec, maxSec]: [number, number]) => {
  const randomSec = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
  return randomSec;
};

type GetBrowserLocalConfig = {
  browserPath: string;
  isView: boolean;
  proxy?: string;
  [key: string]: any;
};

const getBrowser = async (
  localConfig: GetBrowserLocalConfig,
  isMobile = false
) => {
  // change username & password

  // console.log("newProxyUrl : ", newProxyUrl);
  const args = [];
  args.push("-inprivate");
  console.log("localConfig : ", localConfig);
  if (localConfig.proxy) {
    const oldProxyUrl = localConfig.proxy;
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
    // const newProxyUrl = oldProxyUrl;
    console.log("newproxy : ", newProxyUrl);
    args.push("--proxy-server=" + newProxyUrl);
  }
  const browser = await puppeteer.launch({
    executablePath: localConfig.browserPath,
    //  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    //executablePath:
    // "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    browser: "firefox",
    headless: false,
    args,
    defaultViewport: {
      width: isMobile ? 400 : 1920,
      height: isMobile ? 800 : 1080,
    },
  });
  setTimeout(() => {
    console.log("3분이상 작동시 자동종료");
    browser.close();
  }, 1000 * 60 * 3);
  console.log("parentPort : ", parentPort);
  if (!parentPort) {
    console.warn("parentPort is null");
  } else {
    parentPort.on("message", (message) => {
      console.log("message : ", message);
      if (message === "kill") {
        console.log("kill browser");
        browser.close();
      }
    });
  }

  return browser;
};

const utils = {
  sleep,
  getRandomSec,
  getRandomSecTuple: getRandomMilliSecTuple,
  getBrowser,
};
export default utils;
