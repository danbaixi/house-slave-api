// 获取二手房指导价数据
const Excel = require("exceljs");
const redis = require('../service/redis')

const CACHE_KEY = 'guide_price' // 缓存key 
const EXP = 30 * 24 * 60 * 60 // 缓存有效期

async function getGuidePrice() {
  const cache = await redis.get(CACHE_KEY)
  if (cache) {
    return JSON.parse(cache)
  }
  return parse()
}

// 将指导价excel文件转成json，保存到redis
async function parse() {
  const filename = "./files/zhidao.xlsx";
  const workbook = new Excel.Workbook();
  // 读取文件
  await workbook.xlsx.readFile(filename);
  // 读取第一个sheet
  const sheet = workbook.getWorksheet(1);
  const headerRowCount = 4; // 表头行数
  const list = []; // 结果
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowCount) {
      return;
    }
    const data = row.values;
    if (data[1] == data[2]) {
      // 过滤合并单元格的数据
      return;
    }
    list.push({
      area: data[1].replace(/片区/g, ""),
      town: data[2],
      name: data[3],
      price: data[4].toFixed(2),
    });
  });
  // 保存到redis，一个月有效期
  redis.set(CACHE_KEY, JSON.stringify(list), "EX", EXP);
  return list;
}

module.exports = getGuidePrice