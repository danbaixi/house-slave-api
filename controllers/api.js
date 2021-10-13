const data = require("../service/data");
const { success, fail, formatKey } = require("../service/tool");
const redis = require("../service/redis");
const { types } = require("../service/constant");
const getGuidePrice = require("../service/guide");

class Api {
  static async getData(ctx) {
    // type 数据类型
    // url 页面链接
    let { type, url } = ctx.query;
    url = url ? decodeURIComponent(url) : "";
    // 获取缓存
    try {
      let cacheKey = type;
      if (url) {
        //将url转成md5作为redis的key
        cacheKey = formatKey(url);
      }
      const cache = await redis.get(cacheKey);
      if (cache) {
        ctx.body = success(JSON.parse(cache));
        return;
      }
      let result = null;
      // 无缓存重新获取数据
      switch (type) {
        case types.index.key:
          result = await data.getIndexData();
          break;
        case types.today_town.key:
          result = await data.getTodayDataForTown();
          break;
        case types.today_project.key:
          result = await data.getTodayDataForProject();
          break;
        case types.project_info.key:
          result = await data.getProjectInfo(url);
          break;
        case types.room_info.key:
          result = await data.getRoomInfo(url);
          break;
        case types.town_list.key:
          result = await data.getTownList();
          break;
      }
      if (result !== false) {
        ctx.body = success(result);
        return;
      }
      ctx.body = fail();
    } catch (error) {
      console.error(error);
      ctx.body = fail(error.message || "获取失败");
    }
  }

  static async getFormParams(ctx) {
    try {
      const cacheKey = "form_params";
      const cache = await redis.get(cacheKey);
      if (cache) {
        ctx.body = success(JSON.parse(cache));
        return;
      }
      const result = await data.getSearchFormParams();
      ctx.body = success(result);
    } catch (error) {
      console.error(error);
      ctx.body = fail(error.message || "获取失败");
    }
  }

  // 搜索房源
  static async search(ctx) {
    try {
      const {
        townName,
        usage = "",
        projectName = "",
        projectSite = "",
        developer = "",
        areaMin = 0,
        areaMax = 0,
      } = ctx.request.body;
      if (!townName) {
        ctx.body = fail("镇区不能为空");
        return;
      }
      if ((areaMin > 0 && areaMax == 0) || (areaMin == 0 && areaMax > 0)) {
        ctx.body = fail("请输入另一个面积");
        return;
      }
      const result = await data.searchNewHouse(
        townName,
        usage,
        projectName,
        projectSite,
        developer,
        areaMin,
        areaMax
      );
      if (result !== false) {
        ctx.body = success(result);
        return;
      }
      ctx.body = fail();
    } catch (error) {
      ctx.body = fail(error.message || "查询失败");
    }
  }

  // 获取二手房参考价
  static async getGuidePrice(ctx) {
    try {
      const result = await getGuidePrice();
      if (result) {
        ctx.body = success(result);
        return;
      }
      ctx.body = fail();
    } catch (error) {
      ctx.body = fail(error.message || "查询失败");
    }
  }
}

module.exports = Api;
