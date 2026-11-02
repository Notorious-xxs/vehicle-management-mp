/** 枚举中文化 / 通用格式化，与 H5 版保持一致 */

const ST_NAME = {
  PENDING: ['c-pend', '待确认'],
  APPROVED: ['c-idle', '已生效'],
  REJECTED: ['c-off', '已拒绝'],
  CLOSED: ['c-off', '已完成']
}

const TYPE_NAME = {
  TAKE: '借用',
  BORROW: '借用',
  TRANSFER: '转移',
  RETURN: '归还',
  SHARE: '分享',
  SHARE_REQ: '共用',
  RELEASE: '释放'
}

const ISS_STATUS = {
  PENDING: ['c-pend', '待处理'],
  RESOLVED: ['c-idle', '已解决'],
  REJECTED: ['c-off', '不予解决']
}

const ISSUE_CATS = ['车辆故障', '设备异常', '软件问题', '其他']

/** 车辆状态标签：[类名, 文案] */
function vehicleChip(v) {
  if (!v) return ['c-off', '—']
  if (v.status === 'DISABLED') return ['c-off', '停用']
  if (v.pending) return ['c-pend', '待确认']
  if (v.holder) return ['c-use', '使用中']
  return ['c-idle', '空闲']
}

/** "2026-11-02 14:30:00" → "11-02 14:30" */
function shortTime(s) {
  if (!s) return ''
  return String(s).slice(5, 16)
}

/** 位置只按楼栋筛：'聚光-B1-12' → '聚光' */
function building(loc) {
  loc = (loc || '').trim()
  if (!loc) return ''
  const i = loc.indexOf('-')
  return i > 0 ? loc.slice(0, i) : loc
}

function uniq(arr) {
  const seen = {}
  const out = []
  arr.forEach(function (x) {
    if (x && !seen[x]) {
      seen[x] = 1
      out.push(x)
    }
  })
  return out.sort()
}

/** 车牌/型号拼一行：架构 + 车型 + 年款 */
function modelText(v) {
  if (!v) return '—'
  const bits = []
  if (v.arch) bits.push(v.arch)
  if (v.model_name) bits.push(v.model_name)
  if (v.year) bits.push(v.year)
  if (!bits.length) return v.model || '—'
  return bits.join(' · ')
}

module.exports = {
  ST_NAME: ST_NAME,
  TYPE_NAME: TYPE_NAME,
  ISS_STATUS: ISS_STATUS,
  ISSUE_CATS: ISSUE_CATS,
  vehicleChip: vehicleChip,
  shortTime: shortTime,
  building: building,
  uniq: uniq,
  modelText: modelText
}
