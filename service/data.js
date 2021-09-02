const superagent = require("superagent");
const cheerio = require("cheerio");
const config = require("../config");
const { trim, formatKey } = require("../service/tool");
const { types } = require("./constant");
const redis = require("../service/redis");

function getUrl(type) {
  let url = null;
  if (!types[type]) {
    url = type;
  } else {
    url = types[type].url;
  }
  if (!url) {
    throw Error("url有误");
  }
  return `${config.BASE_URL}/${url}`;
}

// 爬虫获取数据
function curl(type) {
  const url = getUrl(type);
  console.log(`url:${url}`);
  return new Promise((resolve, reject) => {
    superagent.get(url).end((err, res) => {
      if (err) {
        console.error(`curl ${type} err: ${err}`)
        return reject(err);
      }
      return resolve(cheerio.load(res.text));
    });
  });
}

// 搜索新房发送请求
function curlNewHourse(form) {
  const url =
    "http://dgfc.dg.gov.cn/dgwebsite_v2/Vendition/ProjectInfo.aspx?New=1";
  return new Promise((resolve, reject) => {
    superagent
      .post(url)
      .type("form")
      .send(form)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        const list = [];
        const $ = cheerio.load(res.text);
        $("#resultTable tbody tr")
          .not(".tHead")
          .map((i, el) => {
            const td = $(el).children();
            list.push({
              name: $(td[0]).text(),
              url: $(td[0]).find("a").prop("href"),
              address: $(td[1]).text(),
              stock: $(td[2]).text(),
            });
          });
        return resolve(list);
      });
  });
}

// 获取楼盘信息
function curlProjectInfo(url) {
  return new Promise((resolve, reject) => {
    const info = [];
    superagent
      .get(`http://dgfc.dg.gov.cn/dgwebsite_v2/Vendition/${url}`)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        const $ = cheerio.load(res.text);
        $(".resultTable2 tbody tr").map((i, el) => {
          info.push({
            key: trim($(el).find(".td0").text().replace(/：/g, "")),
            value: trim($(el).find(".td1").text()),
          });
        });
        return resolve(info);
      });
  });
}

// 获取楼盘合同
function curlContract(url) {
  return new Promise((resolve, reject) => {
    superagent
      .get(`http://dgfc.dg.gov.cn/dgwebsite_v2/Vendition/${url}`)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        const $ = cheerio.load(res.text);
        let result = $("form>div").html()
        return resolve(result)
      });
  });
}

// 存储redis
function saveRedis(key, value, exp = config.CACHE_EXPIRED) {
  if (value == '' || value.length == 0) {
    return
  }
  return redis.set(key, JSON.stringify(value), "EX", exp);
}

// 获取首页数据
async function getIndexData() {
  const type = "index";
  const $ = await curl(type);
  const list = [];
  $("#VSTD1_tb1 tr").each((i, el) => {
    if (i > 1) {
      const tr = $(el).children();
      list.push({
        name: trim($(tr[0]).text()),
        hourseCount: trim($(tr[1]).text()),
        hourseArea: trim($(tr[2]).text()),
        shopCount: trim($(tr[3]).text()),
        shopArea: trim($(tr[4]).text()),
        officeCount: trim($(tr[5]).text()),
        officeArea: trim($(tr[6]).text()),
        parkCount: trim($(tr[7]).text()),
        parkArea: trim($(tr[8]).text()),
      });
    }
  });
  // 存入redis
  await saveRedis(type, list);
  return list;
}

// 获取每个镇的今天销售情况
async function getTodayDataForTown() {
  const type = "today_town";
  const $ = await curl(type);
  const list = [];
  console.log($("#VSD1_resultTable").text())
  $("#VSD1_resultTable tbody tr")
    .not(".tHead")
    .map((i, el) => {
      const tr = $(el).children();
      console.log(`town tr: ${tr}`)
      list.push({
        name: trim($(tr[0]).text().replace('东莞市','')),
        hourseCount: trim($(tr[1]).text()),
        hourseArea: trim($(tr[2]).text()),
        shopCount: trim($(tr[3]).text()),
        shopArea: trim($(tr[4]).text()),
        officeCount: trim($(tr[5]).text()),
        officeArea: trim($(tr[6]).text()),
        parkCount: trim($(tr[7]).text()),
        parkArea: trim($(tr[8]).text()),
      });
    });
  // 存入redis
  await saveRedis(type, list);
  return list;
}

// 获取今天楼盘销售情况
async function getTodayDataForProject() {
  const type = "today_project";
  const $ = await curl(type);
  const list = [];
  $("#resultTable tbody tr")
    .not(".tHead")
    .each((i, el) => {
      const td = $(el).children();
      list.push({
        name: $(td[0]).text(),
        url: $(td[0]).find("a").prop("href"),
        address: $(td[1]).text(),
        notRecordCount: $(td[2]).text(),
        recordCount: $(td[3]).text(),
      });
    });
  await saveRedis(type, list);
  return list;
}

// 获取镇区列表
async function getTownList() {
  const type = "town_list";
  const $ = await curl(type);
  const towns = []
  $("#townName option").each((i,el) => {
    towns.push({
      id: $(el).prop('value'),
      name: ($(el).text()).replace('东莞市','')
    })
  })
  await saveRedis(type, towns, 10 * 24 * 60 * 60); // 10天有效期
  return towns;
}

// 获取搜索表单镇区和隐藏字段
async function getSearchFormParams() {
  const type = "form_params";
  const $ = await curl(type);
  const __VIEWSTATE = $("#__VIEWSTATE").prop("value");
  const __EVENTVALIDATION = $("#__EVENTVALIDATION").prop("value");
  if (!__VIEWSTATE || !__EVENTVALIDATION) {
    throw Error("获取失败");
  }
  const result = {
    __VIEWSTATE,
    __EVENTVALIDATION,
  };
  await saveRedis(type, result, 600); // 10分钟有效期
  return result;
}

// 搜索新房
/**
 *
 * @param {*} townName 镇
 * @param {*} usage 用途
 * @param {*} projectName 楼盘名
 * @param {*} projectSite 楼盘位置
 * @param {*} developer 开发商
 * @param {*} areaMin 面积范围最小值
 * @param {*} areaMax 面积范围最大值
 */
async function searchNewHouse(
  townName,
  usage,
  projectName,
  projectSite,
  developer,
  areaMin,
  areaMax
) {
  // 判断是否有缓存
  const cacheKey = `search_${townName}_${usage}`
  const cache = await redis.get(cacheKey)
  if (cache) {
    return JSON.parse(cache)
  }
  const params = await getSearchFormParams();
  const { __VIEWSTATE, __EVENTVALIDATION } = params;
  // usage=全部传空字符串
  if (usage == '全部') {
    usage = ''
  }
  const form = {
    __VIEWSTATE,
    __EVENTVALIDATION,
    townName,
    usage,
    projectName,
    projectSite,
    developer,
    area1: areaMin,
    area2: areaMax,
    pageIndex: 0,
  };
  const result = await curlNewHourse(form);
  saveRedis(cacheKey, result)
  return result;
}

// 获取楼盘信息
async function getProjectInfo(url) {
  const type = `Vendition/${url}`;
  const $ = await curl(type);
  const data = {
    hourse: [],
    project: [],
    info: [],
    developer: [],
    contract: "",
    all: [],
  };
  // 项目明细
  $("#content_1 tbody tr")
    .not(".tHead")
    .map((i, el) => {
      const td = $(el).children("td");
      data.hourse.push({
        num: $(td[0]).text(),
        name: $(td[1]).text(),
        url: $(td[1]).find("a").prop("href"),
        layer: $(td[2]).text(),
        total: $(td[3]).text(),
        type: $(td[4]).text(),
        area: $(td[5]).text()
      });
    });
  // project
  $("#content_2 tbody tr")
    .not(".tHead")
    .map((i, el) => {
      data.project.push({
        key: trim($(el).find(".tar").text().replace(/：/g, "")),
        value: trim($(el).find(".tal").text()),
      });
    });
  // developer
  $("#content_4 tbody tr")
    .not(".tHead")
    .map((i, el) => {
      data.developer.push({
        key: trim($(el).find(".tar").text().replace(/：/g, "")),
        value: trim($(el).find(".tal").text()),
      });
    });
  // all
  $("#content_6 tbody tr")
    .not(".tHead")
    .map((i, el) => {
      const td = $(el).children();
      data.all.push({
        name: $(td[0]).text(),
        url: $(td[0]).find("a").prop("href"),
        address: $(td[1]).text(),
        total: $(td[2]).text(),
        stock: $(td[3]).text(),
      });
    });

  // info，iframe里面
  const infoUrl = $("#content_3 iframe").prop("src");
  data.info = await curlProjectInfo(infoUrl);
  // contract，iframe里面
  const contractUrl = $("#content_5 iframe").prop("src");
  data.contract = await curlContract(contractUrl);

  const cacheKey = formatKey(url);
  await saveRedis(cacheKey, data);
  return data;
}

// 获取楼盘销售信息
async function getRoomInfo(url) {
  const type = `Vendition/${url}`;
  const $ = await curl(type);
  const list = [];
  let row = {};
  $("#roomTable > tbody > tr").each((i, el) => {
    if (i == 0){
      return
    }
    row = Object.assign({},{
      name: '',
      rooms: []
    })
    const td = $(el).find('> td')
    row.name = $(td[0]).text();
    $(td[1]).find('tr td').map((i,item) => {
      const info = $(item).attr("title");
      if (!info) {
        return
      }
      const infoList = info.split(/\n/g).map((infoItem) => {
        return infoItem.split("：")[1];
      });
      let name = $(item).find('a').text()
      const area = infoList[0].split(" ")[0]
      const prop = infoList[1]
      const sale = infoList[2]
      let price = '未知'
      let total = '未知'
      if (sale == '可售' || sale == '已售') {
        price = infoList[4].split(" ")[0]
        total = infoList[3].split(" ")[0]
      } else {
        total = sale
        name = $(item).text()
      }
      row['rooms'].push({
        name,
        area,
        prop,
        sale,
        total,
        price,
      });
    })
    list.push(row)
  });

  const cacheKey = formatKey(url);
  await saveRedis(cacheKey, list);
  return list
}

module.exports = {
  getIndexData,
  getTodayDataForTown,
  getTodayDataForProject,
  searchNewHouse,
  getProjectInfo,
  getRoomInfo,
  getTownList
};
