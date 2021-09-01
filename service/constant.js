// 数据类型
const types = {
  index: {
    key: 'index',
    url: 'main/default.aspx'
  },
  today_town: {
    key: 'today_town',
    url: 'vendition/gqxs.aspx?view=all'
  },
  today_project: {
    key: 'today_project',
    url: 'Vendition/TodaySold.aspx'
  },
  form_params: {
    key: 'form_params',
    url: 'Vendition/ProjectInfo.aspx?New=1'
  },
  town_list: {
    key: 'town_list',
    url: 'Vendition/ProjectInfo.aspx?New=1'
  },
  project_info: {
    key: 'project_info',
    url: '' // 动态的
  },
  room_info: {
    key: 'room_info',
    url: '' // 动态的
  }
}

// 房屋性质
const houstTypes = ["全部", "住宅", "别墅", "商铺", "办公", "车库"];

module.exports = {
  types,
  houstTypes
}