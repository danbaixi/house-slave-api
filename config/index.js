const base = {
  BASE_URL: "http://dgfc.dg.gov.cn/dgwebsite_v2", // 数据来源
  CACHE_EXPIRED: 300, // 缓存默认时间（秒）
  port: '3000' // 运行端口
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
  port: '8000',
  redis: {
    port: 6379,
    host: "127.0.0.1",
    password: "",
  },
};

const config = Object.assign(base, process.env.NODE_ENV == "dev" ? dev : pro);

module.exports = config;
