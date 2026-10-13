/**
 * 董事長／總經理對企業 AI 化轉型／升級需求大調查 — 回覆收集
 * 用法：
 * 1. 開一個 Google Sheet → 擴充功能 → Apps Script → 貼上本檔全部內容 → 儲存
 * 2. 函式選單選 setup → 執行一次（授權 + 建立「回覆」工作表與標題列）
 * 3. 部署 → 新增部署作業 → 類型「網頁應用程式」
 *    執行身分：我 ／ 誰可以存取：所有人 → 部署 → 複製網址
 * 4. 把網址貼到 index.html 的 GAS_URL
 * ※ 之後改程式碼要「管理部署作業 → 編輯 → 版本選新版本」，網址才不會變
 */

const SHEET_NAME = '回覆';
const NOTIFY_EMAIL = ''; // 想要每筆新回覆寄通知就填 email，不要就留空

const DIM = ['企業戰略','商業模式','營運流程','組織架構','職務設計','人才價值鏈','管理機制','AI科技／數據底座'];
const ROLES = ['組織與職務再設計架構師','全員AI能力養成者','AI人才供應鏈建構者','人機協作變革推動者','AI倫理法遵信任守門人','人力數據決策分析者','文化與員工體驗塑造者'];
const DUTIES = ['職務影響評估與工作再設計','新興AI職務設置與職能模型','全員分層AI素養培訓','AI人才招募與留任','人力結構調整與轉型路徑','AI成效納入績效獎酬','AI組織架構調整','員工AI使用規範與倫理','高階與董事會AI素養','People Analytics平台'];
const CAPS = ['戰略與商業模式理解','AI與數據技術素養','組織設計與變革管理','工作分析與職務再設計','人力數據分析','學習體系設計','AI倫理法遵風險','跨部門協作影響力','員工體驗與溝通','外部人才生態連結'];
const REL = ['戰略未釐清則難推動','未重規劃則成效難顯','人才價值鏈是關鍵','須同一主管統籌'];

/** [欄位 key, 試算表標題] —— key 必須與前端送出的一致 */
function buildHeaders_() {
  const L = 'abcdefghij';
  const h = [['timestamp', '填答時間']];
  const rows = (q, labels) => labels.forEach((t, i) => h.push([q + L[i], q.toUpperCase() + L[i] + ' ' + t]));
  rows('q1', ['競爭力重要性', '推動急迫性']);
  h.push(['q2', 'Q2 AI導入階段']);
  h.push(['q3', 'Q3 最大障礙'], ['q3_other', 'Q3 其他說明']);
  h.push(['q4', 'Q4 最關鍵改變']);
  h.push(['q5', 'Q5 目前統籌者'], ['q5_other', 'Q5 其他說明']);
  h.push(['q6', 'Q6 最適統籌主管'], ['q6_other', 'Q6 其他說明']);
  rows('q7', DIM.map(d => d + '主責'));
  h.push(['q8', 'Q8 AI轉型指導委員會']);
  h.push(['q9', 'Q9 人資長角色改變'], ['q9_other', 'Q9 其他說明']);
  h.push(['q10', 'Q10 最優先角色']);
  rows('q11', ROLES);
  h.push(['q12', 'Q12 績效責任']);
  rows('q13', DUTIES);
  h.push(['q14', 'Q14 人資部門承擔程度']);
  h.push(['q15', 'Q15 12個月期待成果'], ['q15_other', 'Q15 其他說明']);
  rows('q16', CAPS);
  h.push(['q17', 'Q17 能力落差']);
  h.push(['q18', 'Q18 人資長準備度(1-10)']);
  h.push(['q19', 'Q19 補位傾向']);
  rows('q20', DIM.map(d => d + '準備度'));
  h.push(['q21', 'Q21 優先投入面向']);
  rows('q22', REL);
  h.push(['q23', 'Q23 職位'], ['q23_other', 'Q23 其他說明']);
  h.push(['q24', 'Q24 產業'], ['q24_other', 'Q24 其他說明']);
  h.push(['q25', 'Q25 員工人數']);
  h.push(['q26', 'Q26 人資主管層級']);
  h.push(['name', '姓名'], ['title', '職稱'], ['company', '公司名稱'], ['email', 'Email']);
  h.push(['userAgent', '裝置資訊']);
  return h;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents || '{}');
    if (!data.email || !data.company) throw new Error('缺少必要欄位');

    const headers = buildHeaders_();
    const sheet = getSheet_(headers);
    const row = headers.map(([k]) => k === 'timestamp' ? new Date() : safe_(data[k]));
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, '【CEO AI 調查】新回覆：' + data.company,
        data.company + '／' + (data.name || '') + ' ' + (data.title || '') + '\n' + data.email +
        '\n\n試算表：' + SpreadsheetApp.getActive().getUrl());
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, msg: 'CEO AI Survey endpoint is running' });
}

/** 首次執行：授權並建立工作表 */
function setup() {
  getSheet_(buildHeaders_());
}

function getSheet_(headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers.map(h => h[1])])
      .setFontWeight('bold').setBackground('#1b4f5c').setFontColor('#ffffff').setWrap(true);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(1);
  }
  return sh;
}

/** 防公式注入 + 長度限制 */
function safe_(v) {
  if (v === undefined || v === null) return '';
  let s = String(v).slice(0, 1000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
