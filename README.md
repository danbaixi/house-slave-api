<p align="center">
 <img src="https://qiniu.yunxiaozhi.cn/scene1.jpg"/>
</p>

<h1 align="center">房 莞</h1>
<div align="center">
    <p>随时随地查询东莞楼盘备案价</p>
</div>

## 该项目停止维护，原因如下

1. 该项目发布不久，官方就推出了「莞e认购」微信小程序，该小程序能够查到楼盘备案价。

2. 目前数据接口已失效，原因是「东莞市不动产登记中心」网站升级，已经从(dgfc.dg.gov.cn)转到(dgfcjy.dg.cn:8081)

**综合以上原因，官方已有小程序可查房价，数据网站升级维护需要时间成本，因此决定不再维护此项目。**

## 简介

一款能够快速查询东莞楼盘备案价微信小程序。全部数据来源「东莞市不动产登记中心」(dgfc.dg.gov.cn)，本项目不存储任何数据，仅用于展示。如有侵权，请麻烦联系danbaixixi@gmail.com告知。

<img width="200" src="https://qiniu.yunxiaozhi.cn/fg_qrcode.jpg">

项目前后端均开源：

前端项目：https://github.com/danbaixi/house-slave

后端项目(当前)：https://github.com/danbaixi/house-slave-api

## 如何开发

本项目使用到了`Redis`，请确保本地已安装好并运行了Redis

1. 克隆此项目

```shell
git clone git@github.com:danbaixi/house-slave-api.git
```

2. 安装依赖

```shell
npm install
```

3. 运行

```shell
npm run dev
```

4. 浏览器访问`http:localhost:3000/getData?type=index`，有数据返回即可。

默认端口是`3000`，可通过`/config/index.js`文件来修改。

## 许可证

请认真阅读并遵守以下开源协议

`GPL` [GNU General Public License v3.0](https://github.com/danbaixi/house-slave-api/blob/main/LICENSE)

本项目仅用于学习交流，禁止商用，违者必究。

