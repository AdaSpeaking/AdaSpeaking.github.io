/**
 * AI 轉型核心問題快篩：把問卷作答寫進這張 Google Sheet
 * 使用方式：
 * 1. 在要存資料的 Google Sheet 點「擴充功能」→「Apps Script」
 * 2. 刪掉預設內容，貼上這整段，存檔
 * 3. 右上角「部署」→「新增部署作業」→ 類型選「網頁應用程式」
 *    執行身分：我　／　具有存取權的使用者：所有人
 * 4. 授權後複製「網頁應用程式網址」（/exec 結尾），交給問卷頁面使用
 */
const SHEET_NAME = '快篩回覆';
const HEADERS = ['填寫時間', '公司名稱', '姓名', '職稱', 'Email', '電話',
  'Q1 戰略與商業模式', 'Q2 營運流程', 'Q3 組織與關鍵職務', 'Q4 人才與變革', 'Q5 執行與價值驗證',
  '主要問題', '建議方案', '連動問題', '各類訊號', '來源網址'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    // 防止以 = + - @ 開頭的內容被當成公式
    const clean = v => {
      const s = String(v == null ? '' : v).slice(0, 500);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    const keys = ['company', 'name', 'title', 'email', 'phone', 'q1', 'q2', 'q3', 'q4', 'q5',
      'main', 'plan', 'linked', 'scores', 'page'];
    sh.appendRow([new Date()].concat(keys.map(k => clean(d[k]))));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
