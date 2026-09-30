
const CONFIG = {
  SPREADSHEET_ID: 'SEU_SPREADSHEET_ID_AQUI',
  SHEET_NAME: 'Trello'
};

const COLS = ['TÍTULO', 'DESCRIÇÃO', 'STATUS', 'PRIORIDADE', 'ORDEM'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Arthur Trello')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function _getSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(COLS);
    sheet.getRange(1, 1, 1, COLS.length)
      .setFontWeight('bold')
      .setBackground('#EEF2FF')
      .setFontColor('#1E3A8A');
    sheet.setFrozenRows(1);
    sheet.hideColumns(5);
  }
  return sheet;
}

function _normStatus(s) {
  const u = String(s || '').trim().toUpperCase();
  if (u === 'FEITO' || u === 'CONCLUIDO' || u === 'CONCLUÍDO' || u === 'DONE') return 'FEITO';
  if (u === 'FAZENDO' || u === 'EM ANDAMENTO' || u === 'DOING') return 'FAZENDO';
  return 'A FAZER';
}

function _normPrio(p) {
  const u = String(p || '').trim().toUpperCase();
  if (u.startsWith('A')) return 'ALTA';
  if (u.startsWith('M')) return 'MEDIA';
  return 'BAIXA';
}

function listarTarefas() {
  try {
    const sheet = _getSheet();
    const last = sheet.getLastRow();
    if (last < 2) return { sucesso: true, tarefas: [] };

    const values = sheet.getRange(2, 1, last - 1, COLS.length).getValues();
    const tarefas = values.map((r, i) => ({
      linha: i + 2,
      titulo: String(r[0] || '').trim(),
      descricao: String(r[1] || '').trim(),
      status: _normStatus(r[2]),
      prioridade: _normPrio(r[3]),
      ordem: Number(r[4]) || (i + 1)
    })).filter(t => t.titulo);

    const ordem = { 'A FAZER': 0, 'FAZENDO': 1, 'FEITO': 2 };
    tarefas.sort((a, b) => (ordem[a.status] - ordem[b.status]) || (a.ordem - b.ordem));

    return { sucesso: true, tarefas };
  } catch (err) {
    return { sucesso: false, erro: err.toString(), tarefas: [] };
  }
}

function criarTarefa(dados) {
  try {
    if (!dados || !dados.titulo || !dados.titulo.trim())
      return { sucesso: false, erro: 'Título obrigatório.' };

    const sheet = _getSheet();
    const status = _normStatus(dados.status);
    const prioridade = _normPrio(dados.prioridade);

    const last = sheet.getLastRow();
    let menorOrdem = 1;
    if (last >= 2) {
      const rows = sheet.getRange(2, 1, last - 1, COLS.length).getValues();
      const ordens = rows.filter(r => _normStatus(r[2]) === status).map(r => Number(r[4]) || 0);
      menorOrdem = ordens.length ? Math.min(...ordens) - 1 : 1;
    }

    sheet.appendRow([
      dados.titulo.trim(),
      (dados.descricao || '').trim(),
      status,
      prioridade,
      menorOrdem
    ]);

    return { sucesso: true };
  } catch (err) {
    return { sucesso: false, erro: err.toString() };
  }
}

function atualizarTarefa(linha, campos) {
  const linhaNum = parseInt(linha, 10);
  if (!linhaNum || linhaNum < 2) return { sucesso: false, erro: 'Linha inválida.' };

  const sheet = _getSheet();
  if (linhaNum > sheet.getLastRow()) return { sucesso: false, erro: 'Linha fora da planilha.' };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (campos.status != null) sheet.getRange(linhaNum, 3).setValue(_normStatus(campos.status));
    if (campos.prioridade != null) sheet.getRange(linhaNum, 4).setValue(_normPrio(campos.prioridade));
    if (campos.titulo != null) sheet.getRange(linhaNum, 1).setValue(String(campos.titulo));
    if (campos.descricao != null) sheet.getRange(linhaNum, 2).setValue(String(campos.descricao));
  } finally {
    lock.releaseLock();
  }
  return { sucesso: true };
}

function excluirTarefa(linha) {
  const linhaNum = parseInt(linha, 10);
  if (!linhaNum || linhaNum < 2) return { sucesso: false, erro: 'Linha inválida.' };

  const sheet = _getSheet();
  if (linhaNum > sheet.getLastRow()) return { sucesso: false, erro: 'Linha fora da planilha.' };

  sheet.deleteRow(linhaNum);
  return { sucesso: true };
}

function salvarOrdem(status, listaDeLinhas) {
  const statusNorm = _normStatus(status);
  const sheet = _getSheet();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    listaDeLinhas.forEach((linha, idx) => {
      sheet.getRange(linha, 3).setValue(statusNorm);
      sheet.getRange(linha, 5).setValue(idx + 1);
    });
  } finally {
    lock.releaseLock();
  }
  return { sucesso: true };
}
