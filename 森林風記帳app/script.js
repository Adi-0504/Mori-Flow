const activeUser = localStorage.getItem('forest_finance_active_user');
if (!activeUser && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
}

let transactions = [];
let chartInstance = null; // Store chart globally

// Provide a function to construct the category map safely considering i18n
function getCategoryMap() {
    return {
        expense: [
            { id: "food", label: t("cat_food"), icon: "utensils" },
            { id: "transport", label: t("cat_transport"), icon: "car" },
            { id: "life", label: t("cat_life"), icon: "home" }, 
            { id: "entertainment", label: t("cat_ent"), icon: "film" },
            { id: "learning", label: t("cat_learn"), icon: "book-open" },
            { id: "health", label: t("cat_health"), icon: "heart" }
        ],
        income: [
            { id: "income", label: t("cat_income"), icon: "dollar-sign" }
        ]
    };
}

let currentDate = new Date();
let selectedDate = new Date();

// --- GAMIFICATION LOGIC ---
function updateStreak() {
    if (transactions.length === 0) {
        document.getElementById('streak-count').textContent = 0;
        return;
    }
    const today = new Date();
    const toYMD = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    
    let currentYMD = toYMD(today);
    let yesterdayDate = new Date(today);
    yesterdayDate.setDate(today.getDate() - 1);
    let yesterdayYMD = toYMD(yesterdayDate);

    const uniqueDates = [...new Set(transactions.map(tx => tx.date))].sort((a,b) => b.localeCompare(a));
    let streak = 0;

    if (uniqueDates[0] === currentYMD) {
        streak = 1;
        let checkDate = new Date(today);
        for(let i=1; i<uniqueDates.length; i++) {
            checkDate.setDate(checkDate.getDate() - 1);
            if(uniqueDates[i] === toYMD(checkDate)) streak++;
            else break;
        }
    } else if (uniqueDates[0] === yesterdayYMD) {
        streak = 1;
        let checkDate = new Date(yesterdayDate);
        for(let i=1; i<uniqueDates.length; i++) {
            checkDate.setDate(checkDate.getDate() - 1);
            if(uniqueDates[i] === toYMD(checkDate)) streak++;
            else break;
        }
    }

    const badgeObj = document.getElementById('streak-count');
    if(badgeObj) badgeObj.textContent = streak;
    
    const badgeContainer = document.getElementById('streak-badge');
    if (badgeContainer) {
        if (streak > 0) {
            badgeContainer.classList.add('streak-active');
            badgeContainer.style.color = '#E06B6B';
        } else {
            badgeContainer.classList.remove('streak-active');
            badgeContainer.style.color = 'var(--text-muted)';
        }
    }
}

let globalAudioCtx = null;

function playSubmitEffect() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!globalAudioCtx && AudioContext) {
            globalAudioCtx = new AudioContext();
        }
        
        if (globalAudioCtx) {
            if(globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
            const osc = globalAudioCtx.createOscillator();
            const gainNode = globalAudioCtx.createGain();
            osc.type = 'sine';
            
            // Generate a pleasing organic "pop" sound
            osc.frequency.setValueAtTime(400, globalAudioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(800, globalAudioCtx.currentTime + 0.08);
            
            gainNode.gain.setValueAtTime(0.4, globalAudioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, globalAudioCtx.currentTime + 0.08);
            
            osc.connect(gainNode);
            gainNode.connect(globalAudioCtx.destination);
            
            osc.start(globalAudioCtx.currentTime);
            osc.stop(globalAudioCtx.currentTime + 0.1);
        }
    } catch(e) {
        console.log("Audio creation skipped:", e);
    }

    for (let i = 0; i < 15; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'burst-leaf';
        const colors = ['#2F6B4F', '#A9C7B3', '#81C784', '#4CAF50', '#E06B6B'];
        leaf.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        leaf.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';
        
        leaf.style.left = `calc(50% - 12px + ${(Math.random() - 0.5) * 60}px)`;
        leaf.style.top = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
        
        leaf.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
        leaf.style.setProperty('--ty', `${-100 - Math.random() * 150}px`);
        leaf.style.setProperty('--duration', `${0.6 + Math.random() * 0.4}s`);
        
        document.body.appendChild(leaf);
        setTimeout(() => leaf.remove(), 1200);
    }
}

// --- DATA LOGIC ---
function loadTransactions() {
    if (!activeUser) return;
    const key = `forest_finance_txs_${activeUser}`;
    transactions = JSON.parse(localStorage.getItem(key)) || [];
}

function saveTransactions() {
    if (!activeUser) return;
    const key = `forest_finance_txs_${activeUser}`;
    localStorage.setItem(key, JSON.stringify(transactions));
}

// --- TAB NAVIGATION ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(n => { n.classList.remove('active'); });
            sections.forEach(s => s.classList.remove('active'));

            item.classList.add('active');
            const targetSec = document.getElementById(targetId);
            if(targetSec) targetSec.classList.add('active');

            if (targetId === 'page-ledger') {
                pageTitle.textContent = t('title_ledger');
                renderCalendar();
                renderTransactionsForDay(selectedDate);
            } else if (targetId === 'page-accounts') {
                pageTitle.textContent = t('title_accounts');
                updateAccountsData();
            } else if (targetId === 'page-add') {
                pageTitle.textContent = t('title_add');
                
                const yyyy = selectedDate.getFullYear();
                const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const dd = String(selectedDate.getDate()).padStart(2, '0');
                document.getElementById('tx-date').value = `${yyyy}-${mm}-${dd}`;
                
            } else if (targetId === 'page-charts') {
                pageTitle.textContent = t('title_charts');
                renderCharts(); // Render Chart.js
            } else if (targetId === 'page-settings') {
                pageTitle.textContent = t('title_settings');
            }
        });
    });
}

// --- GLOBE SETTINGS ---
function initGlobeSettings() {
    const globeBtn = document.getElementById('globe-btn');
    const modal = document.getElementById('global-setting-modal');
    const closeBtn = document.getElementById('close-globe-modal');
    const applyBtn = document.getElementById('apply-globe-btn');
    const langSelect = document.getElementById('select-lang');
    const currSelect = document.getElementById('select-curr');

    if(!globeBtn) return;

    langSelect.value = userLang;
    currSelect.value = userCurr;

    globeBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    
    applyBtn.addEventListener('click', () => {
        localStorage.setItem('forest_finance_lang', langSelect.value);
        localStorage.setItem('forest_finance_curr', currSelect.value);
        window.location.reload(); // Reload immediately applies translations cleanly
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

// --- ACCOUNTS LOGIC ---
function updateAccountsData() {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalBalance = 0;

    transactions.forEach(tx => {
        totalBalance += tx.amount;
        if (tx.amount > 0) totalIncome += tx.amount;
        else totalExpense += Math.abs(tx.amount);
    });

    document.getElementById('acc-total-balance').textContent = fmtMoneyPlain(totalBalance);
    document.getElementById('acc-total-income').textContent = fmtMoneyPlain(totalIncome);
    document.getElementById('acc-total-expense').textContent = fmtMoneyPlain(totalExpense);
}

// --- CALENDAR LOGIC ---
function renderWeekDays() {
    const dow = document.getElementById('days-of-week-header');
    if(!dow) return;
    const weekMap = {
        "zh-TW": ["日","一","二","三","四","五","六"],
        "zh-CN": ["日","一","二","三","四","五","六"],
        "en": ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    };
    const days = weekMap[userLang] || weekMap["zh-TW"];
    dow.innerHTML = days.map(d => `<div>${d}</div>`).join('');
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    let monthStr = "";
    if(userLang.includes('zh')) monthStr = `${year}年 ${month + 1}月`;
    else monthStr = `${new Intl.DateTimeFormat(userLang, {month:'long'}).format(currentDate)} ${year}`;
    
    document.getElementById('month-year-display').textContent = monthStr;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();
    
    const daysGrid = document.getElementById('calendar-days');
    if(!daysGrid) return;
    daysGrid.innerHTML = '';

    for (let i = firstDayIndex; i > 0; i--) {
        const btn = document.createElement('button');
        btn.textContent = prevLastDay - i + 1;
        btn.className = 'other-month';
        daysGrid.appendChild(btn);
    }

    const daysWithData = new Set();
    transactions.forEach(tx => {
        const parts = tx.date.split('-');
        if(parts.length === 3) {
            const txY = parseInt(parts[0], 10);
            const txM = parseInt(parts[1], 10) - 1;
            const txD = parseInt(parts[2], 10);
            if(txY === year && txM === month) {
                daysWithData.add(txD);
            }
        }
    });

    const today = new Date();
    for (let i = 1; i <= lastDay; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        
        if (daysWithData.has(i)) btn.classList.add('has-data');

        const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        if (isToday) btn.classList.add('today');
        
        const isSelected = i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
        if (isSelected) btn.classList.add('selected');

        btn.addEventListener('click', () => {
            selectedDate = new Date(year, month, i);
            renderCalendar(); 
            renderTransactionsForDay(selectedDate);
        });
        daysGrid.appendChild(btn);
    }

    const nextDays = 42 - (firstDayIndex + lastDay);
    for (let i = 1; i <= nextDays; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'other-month';
        daysGrid.appendChild(btn);
    }
}

document.getElementById('prev-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('next-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// --- TRANSACTIONS UI ---
function renderTransactionsForDay(dateObj) {
    const listElement = document.getElementById('transaction-list');
    if(!listElement) return;

    let dateTitle = "";
    if(userLang.includes('zh')) dateTitle = `${dateObj.getMonth()+1}月${dateObj.getDate()}日 ${t('day_activity')}`;
    else dateTitle = `${new Intl.DateTimeFormat(userLang, {month:'short', day:'numeric'}).format(dateObj)} ${t('day_activity')}`;
    
    document.getElementById('selected-date-display').textContent = dateTitle;

    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;
    
    const dayTxs = transactions.filter(tx => tx.date === dateString);

    if (dayTxs.length === 0) {
        listElement.innerHTML = `<div class="empty-state">${t('empty_ledger')}</div>`;
        return;
    }

    const sortedTxs = [...dayTxs].sort((a,b) => b.id - a.id);
    const cmap = getCategoryMap();
    const allCat = [...cmap.expense, ...cmap.income];

    listElement.innerHTML = sortedTxs.map(tx => {
        const cat = allCat.find(c => c.id === tx.category) || { label: tx.category, icon: "tag" };
        return `
        <div class="transaction-item">
            <div class="tx-icon"><i data-lucide="${cat.icon}"></i></div>
            <div class="tx-details">
                <span class="tx-category">${cat.label}</span>
                <span class="tx-note">${tx.note || ''}</span>
            </div>
            <div class="tx-amount ${tx.amount < 0 ? 'negative' : 'positive'}">
                ${fmtMoney(tx.amount)}
            </div>
        </div>`;
    }).join('');

    lucide.createIcons();
}

// --- ADD FORM UI ---
function populateCategories(type) {
    const select = document.getElementById('tx-category');
    if(!select) return;
    const cmap = getCategoryMap();
    select.innerHTML = cmap[type].map(cat => `<option value="${cat.id}">${cat.label}</option>`).join('');
}

document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const type = e.target.getAttribute('data-type');
        document.getElementById('tx-type').value = type;
        populateCategories(type);
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.style.backgroundColor = type === 'income' ? 'var(--income)' : 'var(--expense)';
    });
});

document.getElementById('tx-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeUser) return;

    const type = document.getElementById('tx-type').value; 
    let amountStr = document.getElementById('tx-amount').value;
    let amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) return;
    if (type === 'expense') amount = -amount;

    const category = document.getElementById('tx-category').value;
    const note = document.getElementById('tx-note').value;
    const dateVal = document.getElementById('tx-date').value;

    const newTx = {
        id: Date.now(),
        category,
        note,
        amount,
        date: dateVal
    };

    transactions.push(newTx);
    saveTransactions();
    
    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-note').value = '';

    // Gamification Triggers
    playSubmitEffect();
    updateStreak();
    
    const parts = dateVal.split('-');
    selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10)-1, parseInt(parts[2], 10));
    currentDate = new Date(selectedDate);
    
    document.querySelector('.nav-item[data-target="page-ledger"]').click();
});

// --- CHART LOGIC ---
function renderCharts() {
    const ctx = document.getElementById('expenseChart');
    const emptyMsg = document.getElementById('chart-empty-msg');
    if(!ctx) return;

    // Filter only expense data
    const expenses = transactions.filter(tx => tx.amount < 0);
    
    if(expenses.length === 0) {
        ctx.style.display = 'none';
        emptyMsg.style.display = 'flex';
        return;
    } else {
        ctx.style.display = 'block';
        emptyMsg.style.display = 'none';
    }

    // Aggregate by category
    const categoryTotals = {};
    expenses.forEach(tx => {
        if(!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
        categoryTotals[tx.category] += Math.abs(tx.amount);
    });

    const cmap = getCategoryMap().expense;
    const labels = [];
    const data = [];
    // Deep forest colors pallete
    const bgColors = [
        '#2F6B4F', '#A9C7B3', '#4CAF50', '#81C784', '#388E3C', '#E06B6B', '#1F2A24'
    ];

    Object.keys(categoryTotals).forEach(catId => {
        const matchingCat = cmap.find(c => c.id === catId);
        labels.push(matchingCat ? matchingCat.label : catId);
        data.push(categoryTotals[catId]);
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: "'Nunito', 'Microsoft JhengHei', sans-serif" } }
                }
            }
        }
    });
}

// --- SETTINGS / LOGOUT ---
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('forest_finance_active_user');
    window.location.href = 'login.html';
});

// Boot up
window.addEventListener('DOMContentLoaded', () => {
    if(!activeUser) return;
    
    // Core boot configs
    translatePage(); 
    initGlobeSettings();
    renderWeekDays();
    lucide.createIcons();
    
    const displayUser = document.getElementById('display-userid');
    if(displayUser) displayUser.textContent = activeUser;

    loadTransactions();
    initNavigation();
    updateStreak();
    
    populateCategories('expense');
    
    // Auto jump to ledger
    renderCalendar();
    renderTransactionsForDay(selectedDate);
});
