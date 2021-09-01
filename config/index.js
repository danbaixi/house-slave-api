const base = {
  BASE_URL: "http://dgfc.dg.gov.cn/dgwebsite_v2",
  CACHE_EXPIRED: 300
};

// 开发环境
const dev = {
  mode: "dev",
  redis: {
    port: 6379,
    host: "127.0.0.1",
    password: "",
  },
};

// 生产环境
const pro = {
  mode: "pro",
  redis: {
    port: 6379,
    host: "127.0.0.1",
    password: "",
  },
};

const config = Object.assign(process.env.NODE_ENV == "dev" ? dev : pro, base);

module.exports = config;
