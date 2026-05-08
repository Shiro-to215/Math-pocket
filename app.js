const problems = [
  {id:1, title:'問題1', expr:'2*x + 1', img:'images/prob1.svg'},
  {id:2, title:'問題2', expr:'x*x - 3*x + 5', img:'images/prob2.svg'},
  {id:3, title:'問題3', expr:'(x+2)/3', img:'images/prob3.svg'}
];

const problemsEl = document.getElementById('problems');
const selector = document.getElementById('selector');
const numbersEl = document.getElementById('numbers');
const selTitle = document.getElementById('sel-title');
const cancelBtn = document.getElementById('cancel');
const resultEl = document.getElementById('result');
const resultText = document.getElementById('result-text');
const closeResultBtn = document.getElementById('close-result');

let currentProblem = null;

function renderProblems(){
  problems.forEach(p=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `\n+      <img src="${p.img}" alt="${p.title}">\n+      <h3>${p.title}</h3>`;
    card.addEventListener('click', ()=>openSelector(p));
    problemsEl.appendChild(card);
  });
}

function openSelector(problem){
  currentProblem = problem;
  selTitle.textContent = `${problem.title} — 数字を選んでください`;
  numbersEl.innerHTML = '';
  for(let i=1;i<=13;i++){
    const b = document.createElement('button');
    b.textContent = i;
    b.addEventListener('click', ()=>onNumberSelect(i));
    numbersEl.appendChild(b);
  }
  selector.classList.remove('hidden');
}

function onNumberSelect(n){
  selector.classList.add('hidden');
  if(!currentProblem) return;
  const expr = currentProblem.expr;
  let value;
  try{
    const fn = new Function('x', `return ${expr}`);
    value = fn(n);
  }catch(e){
    value = '式の評価に失敗しました';
  }
  resultText.textContent = `式: ${expr}  |  x=${n} → 結果: ${value}`;
  resultEl.classList.remove('hidden');
}

cancelBtn.addEventListener('click', ()=>{selector.classList.add('hidden'); currentProblem=null});
closeResultBtn.addEventListener('click', ()=>{resultEl.classList.add('hidden'); currentProblem=null});

renderProblems();
