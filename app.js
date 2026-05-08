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

// === Fraction utility ===
class Fraction{
  constructor(n,d=1){
    n = Number(n); d = Number(d);
    if(!Number.isFinite(n) || !Number.isFinite(d)) throw new Error('Invalid fraction');
    if(d===0) throw new Error('Division by zero');
    if(d<0){ n=-n; d=-d }
    this.n = Math.trunc(n);
    this.d = Math.trunc(d);
    this._reduce();
  }
  _gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){[a,b]=[b,a%b]} return a }
  _reduce(){ const g=this._gcd(this.n,this.d); if(g>1){ this.n/=g; this.d/=g } }
  isInteger(){ return this.d === 1 }
  add(o){ return new Fraction(this.n*o.d + o.n*this.d, this.d*o.d) }
  sub(o){ return new Fraction(this.n*o.d - o.n*this.d, this.d*o.d) }
  mul(o){ return new Fraction(this.n*o.n, this.d*o.d) }
  div(o){ if(o.n===0) throw new Error('Division by zero'); return new Fraction(this.n*o.d, this.d*o.n) }
  factorial(){
    if(!this.isInteger()) throw new Error('階乗は整数にのみ対応しています');
    if(this.n < 0) throw new Error('階乗は0以上の整数にのみ対応しています');
    let result = 1;
    for(let i = 2; i <= this.n; i += 1){
      result *= i;
    }
    return new Fraction(result, 1);
  }
  toString(){ return this.d===1? String(this.n) : `${this.n}/${this.d}` }
}

// === Expression evaluation (tokenize -> shunting-yard -> RPN eval) ===
function tokenize(expr){
  const tokens = [];
  const re = /\s*([0-9]+|x|\(|\)|\+|\-|\*|\/|!)/g;
  let m; let prev = null;
  while((m = re.exec(expr)) !== null){
    let t = m[1];
    // handle unary minus: if '-' and previous is null or one of ( '(', '+','-','*','/' )
    if(t === '-' && (prev === null || ['(','+','-','*','/','!'].includes(prev))){
      tokens.push('0');
    }
    tokens.push(t);
    prev = t;
  }
  return tokens;
}

function toRPN(tokens){
  const out = []; const ops = [];
  const prec = {'+':1,'-':1,'*':2,'/':2};
  for(const t of tokens){
    if(/^[0-9]+$/.test(t) || t==='x'){
      out.push(t);
    }else if(t === '!'){
      out.push(t);
    }else if(t in prec){
      while(ops.length && ops[ops.length-1] !== '(' && prec[ops[ops.length-1]] >= prec[t]){
        out.push(ops.pop());
      }
      ops.push(t);
    }else if(t === '('){ ops.push(t);
    }else if(t === ')'){
      while(ops.length && ops[ops.length-1] !== '(') out.push(ops.pop());
      ops.pop();
    }
  }
  while(ops.length) out.push(ops.pop());
  return out;
}

function evalRPN(rpn, xValue){
  const stack = [];
  const xFrac = new Fraction(xValue,1);
  for(const t of rpn){
    if(/^[0-9]+$/.test(t)) stack.push(new Fraction(Number(t),1));
    else if(t === 'x') stack.push(xFrac);
    else if(t === '!'){
      const a = stack.pop();
      if(!a) throw new Error('Invalid expression');
      stack.push(a.factorial());
    }else if(['+','-','*','/'].includes(t)){
      const b = stack.pop(); const a = stack.pop();
      if(!a || !b) throw new Error('Invalid expression');
      let r;
      if(t === '+') r = a.add(b);
      if(t === '-') r = a.sub(b);
      if(t === '*') r = a.mul(b);
      if(t === '/') r = a.div(b);
      stack.push(r);
    }else{
      throw new Error('Unknown token: ' + t);
    }
  }
  if(stack.length !== 1) throw new Error('Invalid expression evaluation');
  return stack[0];
}

function evaluateAsFraction(expr, x){
  const tokens = tokenize(expr.replace(/\^/g,'**'));
  const rpn = toRPN(tokens);
  return evalRPN(rpn, x);
}

function renderProblems(){
  problems.forEach(p=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `\n      <img src="${p.img}" alt="${p.title}">\n      <h3>${p.title}</h3>`;
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
  let valueStr;
  try{
    const result = evaluateAsFraction(expr, n);
    valueStr = result.toString();
  }catch(e){
    valueStr = '式の評価に失敗しました: ' + e.message;
  }
  resultText.textContent = `式: ${expr}  |  x=${n} → 結果: ${valueStr}`;
  resultEl.classList.remove('hidden');
}

cancelBtn.addEventListener('click', ()=>{selector.classList.add('hidden'); currentProblem=null});
closeResultBtn.addEventListener('click', ()=>{resultEl.classList.add('hidden'); currentProblem=null});

renderProblems();
