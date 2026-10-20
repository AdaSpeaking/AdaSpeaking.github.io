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

const SHEET_NAME = '回覆_1019'; // 1019 版題目；舊版回覆留在「回覆」工作表不動
const NOTIFY_EMAIL = ''; // 想要每筆新回覆寄通知就填 email，不要就留空

const DIM = ['企業戰略','商業模式','營運流程','組織架構','職務設計','人才價值鏈','管理機制','AI科技／數據底座'];

/** [欄位 key, 試算表標題] —— key 必須與前端送出的一致 */
function buildHeaders_() {
  const L = 'abcdefghij';
  const h = [['timestamp', '填答時間']];
  const rows = (q, labels) => labels.forEach((t, i) => h.push([q + L[i], q.toUpperCase() + L[i] + ' ' + t]));
  h.push(['q1', 'Q1 AI導入階段']);
  h.push(['q2', 'Q2 最大障礙'], ['q2_other', 'Q2 其他說明']);
  h.push(['q3', 'Q3 未來三年最關鍵改變']);
  h.push(['q4', 'Q4 最適統籌主管'], ['q4_other', 'Q4 其他說明']);
  rows('q5', DIM.map(d => d + '準備度'));
  h.push(['q6', 'Q6 人資長角色轉變'], ['q6_other', 'Q6 其他說明']);
  h.push(['q7', 'Q7 人資長優先責任']);
  h.push(['q8', 'Q8 人資最高主管準備度(1-10)']);
  h.push(['q9', 'Q9 AI職能掌握程度']);
  h.push(['q10', 'Q10 轉型潛力人才掌握']);
  h.push(['q11', 'Q11 組織與人才隱憂']);
  h.push(['q12', 'Q12 人資團隊補位做法']);
  h.push(['q13', 'Q13 期待支援']);
  h.push(['q14', 'Q14 成功最終指標']);
  h.push(['q15', 'Q15 職位'], ['q15_other', 'Q15 其他說明']);
  h.push(['q16', 'Q16 人資主管層級']);
  h.push(['q17', 'Q17 產業'], ['q17_other', 'Q17 其他說明']);
  h.push(['q18', 'Q18 員工人數']);
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
