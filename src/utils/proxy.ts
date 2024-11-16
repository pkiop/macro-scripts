import proxyList from "../assets/proxy-list.json";
type ProxySetterConfig = {
  proxyChangeTime: number;
};
class ProxySetter {
  private proxyChangeTime: number;
  private proxyList: string[] = proxyList;
  private proxyIndex = 0;
  private proxyChangeInterval: NodeJS.Timeout | null = null;
  constructor(config: ProxySetterConfig) {
    this.proxyChangeTime = config.proxyChangeTime;
    this.proxyIndex = Math.floor(Math.random() * this.proxyList.length);
    this.proxyChangeInterval = setInterval(() => {
      this.proxyIndex = Math.floor(Math.random() * this.proxyList.length);
    }, this.proxyChangeTime * 1000);
  }

  getProxy() {
    return this.proxyList[this.proxyIndex];
  }
}

export default ProxySetter;
