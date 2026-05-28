// =====================================================
// МЕТАГРАММЫ — словесная игра
// Цепочки взяты из проверенного набора метаграмм
// =====================================================

const PUZZLES = [
  { solution: ['МАМА','ЛАМА','ЛАПА','ПАПА'] },
  { solution: ['КОЗА','ПОЗА','ПОЛА','ПОЛК','ВОЛК'] },
  { solution: ['КОЗА','ЛОЗА','ЛУЗА','ЛУПА','ЛИПА','ЛИСА'] },
  { solution: ['КОЗА','КОРА','КАРА','ФАРА','ФАРС','БАРС'] },
  { solution: ['ДОМ','КОМ','ЛОМ','РОМ','СОМ','ТОМ'] },
  { solution: ['ТОМ','СОМ','РОМ','ЛОМ','КОМ','ДОМ','ДЫМ'] },
  { solution: ['БОЧКА','ДОЧКА','МОЧКА','НОЧКА','ПОЧКА','ТОЧКА'] },
  { solution: ['КОВКА','КОЛКА','КОРКА','КОШКА'] },
  { solution: ['МИГ','МИР','МОР','БОР','БОА','БРА','ЭРА'] },
  { solution: ['ЧАС','БАС','БЕС','ВЕС','ВЕК'] },
  { solution: ['ЧАС','БАС','БАЛ','ВАЛ','ВОЛ','ГОЛ','ГОД'] },
  { solution: ['КОРА','КОЗА','ЛОЗА','ЛУЗА','ЛУПА','ЛИПА','ЛИСА','ЛИСТ'] },
  { solution: ['МЕСТО','МЕСТЬ','МАСТЬ','ПАСТЬ','ПАСТА','ПАРТА'] },
  { solution: ['ЗУБ','КУБ','КУМ','КОМ','КОТ','РОТ'] },
  { solution: ['ДУША','СУША','СУШЬ','СУТЬ','СЕТЬ','СЕНЬ','СЕНО','СЕЛО','ТЕЛО'] },
  { solution: ['МАТЬ','МУТЬ','СУТЬ','СЕТЬ','СЕЛЬ','СОЛЬ','НОЛЬ','НОЧЬ','ДОЧЬ'] },
  { solution: ['БАК','БОК','БЫК','БУК'] },
  { solution: ['БАК','БАЛ','БАР','БАС'] },
  { solution: ['ЛАЙКА','ЛАВКА','ЛАПКА','ЛАСКА'] },
  { solution: ['РОЗА','КОЗА','КОРА','ГОРА'] },
  { solution: ['НОЧЬ','НОЛЬ','СОЛЬ','СЕЛЬ','СЕНЬ','ДЕНЬ'] },
  { solution: ['ЛИСА','ЛИПА','ЛУПА','ЛУЖА','ЛОЖА','ЛОЖЬ','ЛОСЬ'] },
  { solution: ['МИГ','МАГ','МАЙ','ЧАЙ','ЧАС'] },
  { solution: ['ШАР','ПАР','ПАН','САН','СОН','СОМ','КОМ','КУМ','КУБ'] },
  { solution: ['КОСА','РОСА','РАСА','РАНА','РАНТ','БАНТ'] },
  { solution: ['ПАР','ВАР','ВОР','ТОР','ТОК'] }
];

PUZZLES.forEach(p => {
  p.from = p.solution[0];
  p.to = p.solution[p.solution.length - 1];
  p.steps = p.solution.length - 1;
});

const KEYBOARD_ROWS = [
  ['Й','Ц','У','К','Е','Н','Г','Ш','Щ','З','Х','Ъ'],
  ['Ф','Ы','В','А','П','Р','О','Л','Д','Ж','Э'],
  ['Я','Ч','С','М','И','Т','Ь','Б','Ю','Ё']
];

// Словарь — все слова из всех цепочек, как mvp-валидатор
const WORD_DICT = new Set();
PUZZLES.forEach(p => p.solution.forEach(w => WORD_DICT.add(w)));

// =====================================================
// Состояние
// =====================================================

const state = {
  current: 0,
  chain: [PUZZLES[0].from],
  draft: null
};

const $ = id => document.getElementById(id);

// =====================================================
// Утилиты
// =====================================================

function diffPositions(a, b) {
  const positions = new Set();
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) positions.add(i);
  }
  return positions;
}

function diffCount(a, b) {
  if (a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }
  return d;
}

function initDraft() {
  const last = state.chain[state.chain.length - 1];
  if (last === PUZZLES[state.current].to) {
    state.draft = null;
    return;
  }
  state.draft = {
    letters: last.split(''),
    activeIdx: 0,
    baseWord: last
  };
}

// =====================================================
// Рендер
// =====================================================

function renderTask() {
  const p = PUZZLES[state.current];
  $('task-label').textContent = 'Загадка ' + (state.current + 1) + ' из ' + PUZZLES.length;
  $('task-from').textContent = p.from;
  $('task-to').textContent = p.to;
  $('task-par').textContent = p.steps + ' ходов';
}

function buildRow(numText, word, opts) {
  opts = opts || {};
  const row = document.createElement('div');
  row.className = 'row';

  const num = document.createElement('span');
  num.className = 'row-label';
  num.textContent = numText;
  row.appendChild(num);

  const cells = document.createElement('div');
  cells.className = 'row-cells';

  const len = opts.length || (word ? word.length : 0);
  const baseWord = opts.baseWord || null;

  for (let idx = 0; idx < len; idx++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const ch = word ? word[idx] : '';

    if (opts.kind === 'locked') {
      cell.textContent = ch;
      cell.classList.add('locked');
    } else if (opts.kind === 'target') {
      cell.textContent = ch;
      cell.classList.add('target');
    } else if (opts.kind === 'changed') {
      cell.textContent = ch;
      if (baseWord && baseWord[idx] !== ch) {
        cell.classList.add('changed');
      } else {
        cell.classList.add('locked');
      }
    } else if (opts.kind === 'draft') {
      cell.textContent = ch;
      const changed = baseWord[idx] !== ch;
      if (idx === opts.activeIdx) {
        cell.classList.add('active');
      } else if (changed) {
        cell.classList.add('changed');
      } else {
        cell.classList.add('editable');
      }
      cell.dataset.idx = idx;
      cell.addEventListener('click', () => {
        state.draft.activeIdx = idx;
        renderLadder();
      });
    } else if (opts.kind === 'empty') {
      cell.classList.add('empty');
      cell.classList.add('future');
    }
    cells.appendChild(cell);
  }
  row.appendChild(cells);

  const sfx = document.createElement('span');
  sfx.className = 'row-suffix';
  if (opts.suffix) {
    sfx.innerHTML = opts.suffix;
  }
  row.appendChild(sfx);

  return row;
}

function renderLadder() {
  const p = PUZZLES[state.current];
  const target = p.to;
  const totalSteps = p.steps;
  const wordLen = p.from.length;
  const ladder = $('ladder');
  ladder.innerHTML = '';

  // 1. Старт
  ladder.appendChild(buildRow('0', p.from, {
    kind: 'locked',
    suffix: 'старт'
  }));

  // 2. Подтверждённые ходы
  for (let i = 1; i < state.chain.length; i++) {
    const isTarget = state.chain[i] === target;
    ladder.appendChild(buildRow(String(i), state.chain[i], {
      kind: isTarget ? 'target' : 'changed',
      baseWord: state.chain[i - 1],
      suffix: isTarget ? '<i class="ti ti-trophy" aria-hidden="true"></i> цель' : ''
    }));
  }

  const committedCount = state.chain.length - 1;
  const lastIsTarget = state.chain[state.chain.length - 1] === target;

  // 3. Черновик
  if (state.draft && !lastIsTarget) {
    const draftRowIndex = state.chain.length;
    ladder.appendChild(buildRow(String(draftRowIndex), state.draft.letters.join(''), {
      kind: 'draft',
      baseWord: state.draft.baseWord,
      activeIdx: state.draft.activeIdx,
      suffix: '<button id="btn-confirm" class="btn btn-confirm">OK</button>'
    }));
    const confirmBtn = $('btn-confirm');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmDraft);
  }

  // 4. Пустые будущие строки
  const futureEmptyCount = Math.max(
    0,
    totalSteps - committedCount - (state.draft && !lastIsTarget ? 1 : 0)
  );
  for (let k = 0; k < futureEmptyCount; k++) {
    const rowNum = committedCount + (state.draft && !lastIsTarget ? 1 : 0) + 1 + k;
    ladder.appendChild(buildRow(String(rowNum), null, {
      kind: 'empty',
      length: wordLen,
      suffix: ''
    }));
  }

  // 5. Превью цели
  if (!lastIsTarget) {
    const previewWrap = document.createElement('div');
    previewWrap.className = 'preview-wrap';
    previewWrap.appendChild(buildRow(String(totalSteps), target, {
      kind: 'target',
      suffix: 'цель'
    }));
    ladder.appendChild(previewWrap);
  }
}

function setFeedback(text, kind) {
  const el = $('feedback');
  el.textContent = text;
  el.className = 'feedback' + (kind ? ' ' + kind : '');
}

// =====================================================
// Действия
// =====================================================

function pressLetter(letter) {
  if (!state.draft) return;
  state.draft.letters[state.draft.activeIdx] = letter;
  setFeedback('', '');
  renderLadder();
}

function pressBackspace() {
  if (!state.draft) return;
  state.draft.letters[state.draft.activeIdx] = state.draft.baseWord[state.draft.activeIdx];
  setFeedback('', '');
  renderLadder();
}

function confirmDraft() {
  if (!state.draft) return;
  const newWord = state.draft.letters.join('');
  const base = state.draft.baseWord;
  const target = PUZZLES[state.current].to;

  if (newWord === base) {
    setFeedback('Поменяй одну букву', 'err');
    return;
  }
  const d = diffCount(base, newWord);
  if (d !== 1) {
    setFeedback('Меняй ровно одну букву (сейчас разных: ' + d + ')', 'err');
    return;
  }
  if (state.chain.includes(newWord)) {
    setFeedback('Это слово уже было', 'err');
    return;
  }
  if (!WORD_DICT.has(newWord)) {
    setFeedback('Слова «' + newWord + '» нет в словаре', 'err');
    return;
  }

  state.chain.push(newWord);

  if (newWord === target) {
    const par = PUZZLES[state.current].steps;
    const used = state.chain.length - 1;
    const verdict = used <= par ? 'идеально' : used <= par + 2 ? 'неплохо' : 'есть короче';
    setFeedback('Готово за ' + used + ' ходов — ' + verdict, 'ok');
    state.draft = null;

    // Виброотклик победы, если поддерживается
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  } else {
    initDraft();
    setFeedback('', '');
    if (navigator.vibrate) navigator.vibrate(15);
  }
  renderLadder();
}

function hint() {
  const sol = PUZZLES[state.current].solution;
  const last = state.chain[state.chain.length - 1];
  const idx = sol.indexOf(last);
  if (idx === -1 || idx >= sol.length - 1) {
    setFeedback('Ты ушёл от эталонного пути — продолжай свой', 'hint');
    return;
  }
  const next = sol[idx + 1];
  const positions = [...diffPositions(last, next)];
  const pos = positions[0];
  const letter = next[pos];
  setFeedback('Подсказка: «' + letter + '» на позиции ' + (pos + 1), 'hint');
  if (state.draft) {
    state.draft.activeIdx = pos;
    renderLadder();
  }
}

function undo() {
  if (state.chain.length <= 1) return;
  state.chain.pop();
  initDraft();
  setFeedback('', '');
  renderLadder();
}

function reset() {
  state.chain = [PUZZLES[state.current].from];
  initDraft();
  setFeedback('', '');
  renderLadder();
}

function loadPuzzle(i) {
  state.current = i;
  state.chain = [PUZZLES[i].from];
  initDraft();
  setFeedback('', '');
  $('puzzle-list').hidden = true;
  renderTask();
  renderLadder();
}

function togglePuzzles() {
  const el = $('puzzle-list');
  if (el.hidden) {
    el.innerHTML = '';
    PUZZLES.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'puzzle-item' + (i === state.current ? ' current' : '');
      row.innerHTML =
        '<span class="puzzle-item-pair">' + p.from + ' → ' + p.to + '</span>' +
        '<span class="puzzle-item-steps">' + p.steps + ' ходов</span>';
      row.addEventListener('click', () => loadPuzzle(i));
      el.appendChild(row);
    });
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function renderKeyboard() {
  const kb = $('keyboard');
  kb.innerHTML = '';
  KEYBOARD_ROWS.forEach((letters, rowIdx) => {
    const row = document.createElement('div');
    row.className = 'kb-row';
    letters.forEach(letter => {
      const key = document.createElement('div');
      key.className = 'kb-key';
      key.textContent = letter;
      key.addEventListener('click', () => pressLetter(letter));
      row.appendChild(key);
    });
    if (rowIdx === KEYBOARD_ROWS.length - 1) {
      const back = document.createElement('div');
      back.className = 'kb-key wide';
      back.innerHTML = '<i class="ti ti-backspace" aria-hidden="true"></i>';
      back.setAttribute('aria-label', 'Стереть');
      back.addEventListener('click', pressBackspace);
      row.appendChild(back);
    }
    kb.appendChild(row);
  });
}

// =====================================================
// Старт
// =====================================================

function init() {
  $('btn-hint').addEventListener('click', hint);
  $('btn-undo').addEventListener('click', undo);
  $('btn-reset').addEventListener('click', reset);
  $('btn-puzzles').addEventListener('click', togglePuzzles);

  // Физическая клавиатура — для десктопа
  document.addEventListener('keydown', e => {
    if (e.key === 'Backspace') {
      pressBackspace();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      confirmDraft();
      e.preventDefault();
    } else if (/^[а-яёА-ЯЁ]$/.test(e.key)) {
      pressLetter(e.key.toUpperCase());
    }
  });

  initDraft();
  renderTask();
  renderLadder();
  renderKeyboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
