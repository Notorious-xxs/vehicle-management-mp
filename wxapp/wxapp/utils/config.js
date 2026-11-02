/**
 * 接口地址配置
 *
 * ★ 部署前必改：
 *   1. API_BASE 换成你自己服务器的域名，必须 https、且不带结尾斜杠
 *      - 后端 BASE_URL=https://xxx.com/vehicle  →  API_BASE = 'https://xxx.com/vehicle'
 *      - 小程序正式版要求该域名已在小程序后台「request 合法域名」里登记
 *   2. 开发阶段可在微信开发者工具勾选「不校验合法域名」先联调
 */
const API_BASE = 'https://www.pokeroom.cn/vehicle'

module.exports = { API_BASE }
