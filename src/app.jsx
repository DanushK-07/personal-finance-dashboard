import React, { useMemo, useState } from 'react';
import {
  Home, Wallet, CalendarDays, ChartNoAxesColumn, Settings, Bell,
  UserRound, ArrowUpRight, ArrowDownRight, Target, Lightbulb,
  Utensils, PiggyBank, ChevronRight, Clock3, ShoppingBag,
  CarFront, Smartphone, Plus, Search, Download, X, TrendingUp,
  Sprout, Menu, Trash2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

const INITIAL_TRANSACTIONS = [
  { id: 1, title: 'Grocery shopping', category: 'Shopping', date: '2026-10-24', amount: 1250, type: 'Expense', icon: 'bag' },
  { id: 2, title: 'Fuel', category: 'Transport', date: '2026-10-23', amount: 1800, type: 'Expense', icon: 'car' },
  { id: 3, title: 'Monthly salary', category: 'Income', date: '2026-10-22', amount: 45000, type: 'Income', icon: 'wallet' },
  { id: 4, title: 'Restaurant', category: 'Food & Dining', date: '2026-10-21', amount: 850, type: 'Expense', icon: 'food' },
  { id: 5, title: 'Mobile recharge', category: 'Bills & Utilities', date: '2026-10-20', amount: 299, type: 'Expense', icon: 'phone' }
];

const CHART_DATA = [
  { month: 'May', income: 40000, expenses: 22000 },
  { month: 'Jun', income: 42000, expenses: 25000 },
  { month: 'Jul', income: 40000, expenses: 21000 },
  { month: 'Aug', income: 45000, expenses: 27000 },
  { month: 'Sep', income: 43000, expenses: 23000 },
  { month: 'Oct', income: 45000, expenses: 18500 }
];

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transport',
  'Bills & Utilities', 'Health', 'Education',
  'Entertainment', 'Income', 'Other'
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function IconBubble({ children, color = 'blue', size = 'normal' }) {
  return (
    <span className={`icon-bubble ${color} ${size}`}>
      {children}
    </span>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
}

function TransactionIcon({ icon }) {
  if (icon === 'car') return <CarFront size={21} />;
  if (icon === 'wallet') return <Wallet size={21} />;
  if (icon === 'food') return <Utensils size={21} />;
  if (icon === 'phone') return <Smartphone size={21} />;
  return <ShoppingBag size={21} />;
}

export default function App() {
  // All hooks are inside the App component.
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = Number(localStorage.getItem('financeflow-budget'));
    return Number.isFinite(saved) && saved > 0 ? saved : 30000;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = readStorage(
      'financeflow-transactions',
      INITIAL_TRANSACTIONS
    );
    return Array.isArray(saved) ? saved : INITIAL_TRANSACTIONS;
  });

  const [activePage, setActivePage] = useState('Dashboard');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('2026-10');
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [activeDrawer, setActiveDrawer] = useState(null);

const [profile, setProfile] = useState(() =>
  readStorage('financeflow-profile', {
    name: 'FinanceFlow User',
    email: '',
    phone: '',
    occupation: 'Student'
  })
);

const [profileForm, setProfileForm] = useState(profile);

  const [form, setForm] = useState({
    title: '',
    category: 'Food & Dining',
    amount: '',
    type: 'Expense',
    date: new Date().toISOString().slice(0, 10)
  });

  const monthlyTransactions = useMemo(
    () => transactions.filter(item =>
      String(item.date).startsWith(month)
    ),
    [transactions, month]
  );

  const filteredTransactions = useMemo(
    () => monthlyTransactions
      .filter(item =>
        `${item.title} ${item.category} ${item.type}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => b.date.localeCompare(a.date)),
    [monthlyTransactions, search]
  );

  const totals = useMemo(() => {
    const income = monthlyTransactions
      .filter(item => item.type === 'Income')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = monthlyTransactions
      .filter(item => item.type === 'Expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      budget: monthlyBudget,
      remaining: monthlyBudget - expenses
    };
  }, [monthlyTransactions, monthlyBudget]);

  const nav = [
    [Home, 'Dashboard'],
    [Wallet, 'Transactions'],
    [CalendarDays, 'Budgets'],
    [ChartNoAxesColumn, 'Reports'],
    [Settings, 'Settings']
  ];

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function saveTransactions(next) {
    setTransactions(next);
    try {
      localStorage.setItem(
        'financeflow-transactions',
        JSON.stringify(next)
      );
    } catch {
      notify('Could not save data in this browser.');
    }
  }

  function addTransaction(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      notify('Enter a description and an amount greater than zero.');
      return;
    }

    const icon =
      form.type === 'Income' ? 'wallet' :
      form.category === 'Transport' ? 'car' :
      form.category === 'Food & Dining' ? 'food' : 'bag';

    const next = [
      {
        ...form,
        id: Date.now(),
        title: form.title.trim(),
        amount,
        icon
      },
      ...transactions
    ];

    saveTransactions(next);
    setShowModal(false);
    setForm({
      title: '',
      category: 'Food & Dining',
      amount: '',
      type: 'Expense',
      date: new Date().toISOString().slice(0, 10)
    });

    notify('Transaction added successfully.');
  }

  function removeTransaction(id) {
    saveTransactions(
      transactions.filter(item => item.id !== id)
    );
    notify('Transaction deleted.');
  }

  function exportCSV() {
    const rows = [
      ['Title', 'Category', 'Date', 'Type', 'Amount'],
      ...filteredTransactions.map(item => [
        item.title,
        item.category,
        item.date,
        item.type,
        item.amount
      ])
    ];

    const csv = rows
      .map(row =>
        row.map(value =>
          `"${String(value).replaceAll('"', '""')}"`
        ).join(',')
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = `financeflow-${month}-transactions.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('CSV export started.');
  }

  function changeBudget(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      notify('Enter a budget greater than zero.');
      return;
    }

    setMonthlyBudget(amount);

    try {
      localStorage.setItem('financeflow-budget', String(amount));
      notify('Monthly budget saved.');
    } catch {
      notify('Could not save the budget.');
    }
  }

  function TransactionList({ limit }) {
    const items = typeof limit === 'number'
      ? filteredTransactions.slice(0, limit)
      : filteredTransactions;

    if (!items.length) {
      return (
        <div className="empty-state">
          No transactions found for this month.
          Try another month or add a transaction.
        </div>
      );
    }

    return (
      <div className="transaction-list">
        {items.map(item => (
          <div className="transaction-row" key={item.id}>
            <IconBubble
              color={
                item.type === 'Income' ? 'green' :
                item.icon === 'car' ? 'blue' :
                item.icon === 'food' ? 'purple' :
                item.icon === 'phone' ? 'teal' : 'orange'
              }
              size="large"
            >
              <TransactionIcon icon={item.icon} />
            </IconBubble>

            <div className="transaction-name">
              <strong>{item.title}</strong>
              <span>{item.category}</span>
            </div>

            <div className="transaction-date">
              {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                'en-GB',
                { day: '2-digit', month: 'short', year: 'numeric' }
              )}
            </div>

            <div className={`transaction-amount ${
              item.type === 'Income' ? 'is-income' : 'is-expense'
            }`}>
              {item.type === 'Income' ? '+' : '-'} {money(item.amount)}
            </div>

            <span className={`type-pill ${item.type.toLowerCase()}`}>
              {item.type}
            </span>

            {activePage === 'Transactions' && (
              <button
                type="button"
                className="icon-button"
                title="Delete transaction"
                aria-label={`Delete ${item.title}`}
                onClick={() => removeTransaction(item.id)}
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Wallet size={27} />
            <Sprout size={23} className="sprout" />
          </div>
          <div>
            <div className="brand-name">
              Finance<span>Flow</span>
            </div>
            <div className="brand-tag">Plan · Save · Grow</div>
          </div>
        </div>

        <nav>
          {nav.map(([Icon, label]) => (
            <NavItem
              key={label}
              icon={Icon}
              label={label}
              active={activePage === label}
              onClick={() => {
                setActivePage(label);
                setMobileNav(false);
              }}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="growth-art">
            <Sprout size={76} />
            <TrendingUp size={43} />
            <span className="coin">₹</span>
          </div>
          <p>Better Money Habits<br />Brighter Future</p>
          <span className="footer-line" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            type="button"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>

          <div className="welcome">
            <h1>
              {activePage === 'Dashboard'
              ? `Good Morning, ${profile.name || 'there'}`
              : activePage}
              {' '}<span className="wave">👋</span>
              </h1>
            <p>
              {activePage === 'Dashboard'
                ? "Here's your financial overview for this month."
                : `Manage and review your ${activePage.toLowerCase()} information.`}
            </p>
          </div>

          <div className="top-actions">
            <label className="month-picker">
              <CalendarDays size={18} />
              <input
                aria-label="Choose month"
                type="month"
                value={month}
                onChange={event => setMonth(event.target.value)}
              />
            </label>

            <button
            className="icon-button notification"
            type="button"
            title="Notifications"
            aria-label="Open notifications"
            onClick={() => setActiveDrawer('notifications')}
            >
              <Bell size={21} />
              <i />
            </button>

            <button
            className="avatar"
            type="button"
            title="Edit profile"
            aria-label="Open profile"
            onClick={() => {
              setProfileForm(profile);
              setActiveDrawer('profile');
            }}
            >
              <UserRound size={23} />
              </button>
          </div>
        </header>

        {activePage === 'Dashboard' && (
          <>
            <section className="summary-grid">
              <article className="summary-card balance-card">
                <IconBubble color="blue"><Wallet size={25} /></IconBubble>
                <div className="card-label">Monthly Net Balance</div>
                <div className="big-number">{money(totals.balance)}</div>
                <span className="balance-pill">
                  <ArrowUpRight size={16} /> Income minus expenses
                </span>
              </article>

              <article className="summary-card income-card">
                <IconBubble color="green"><Sprout size={25} /></IconBubble>
                <div className="card-label">Monthly Income</div>
                <div className="big-number">{money(totals.income)}</div>
                <div className="trend positive">
                  <ArrowUpRight size={16} /> Recorded income
                </div>
              </article>

              <article className="summary-card expense-card">
                <IconBubble color="red"><Wallet size={25} /></IconBubble>
                <div className="card-label">Monthly Expenses</div>
                <div className="big-number">{money(totals.expenses)}</div>
                <div className="trend negative">
                  <ArrowDownRight size={16} /> Recorded expenses
                </div>
              </article>

              <article className="summary-card budget-card">
                <IconBubble color="purple"><Target size={25} /></IconBubble>
                <div className="card-label">Remaining Budget</div>
                <div className="big-number">{money(totals.remaining)}</div>
                <div className="budget-sub">
                  of {money(totals.budget)} monthly limit
                </div>
                <div className="progress-track">
                  <span style={{
                    width: `${Math.min(100, Math.max(
                      0, totals.expenses / totals.budget * 100
                    ))}%`
                  }} />
                </div>
                <div className="used-label">
                  {Math.round(Math.min(100, Math.max(
                    0, totals.expenses / totals.budget * 100
                  )))}% used
                </div>
              </article>
            </section>

            <section className="middle-grid">
              <article className="panel chart-panel">
                <div className="panel-heading">
                  <IconBubble color="purple">
                    <ChartNoAxesColumn size={22} />
                  </IconBubble>
                  <div>
                    <h2>Income vs. Expenses</h2>
                    <p>Monthly comparison (sample data)</p>
                  </div>
                </div>

                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                    data={CHART_DATA}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    barGap={8}
                >
                  <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf0f6"
                  />
                  
                  <XAxis
                  dataKey="month"
                  tickFormatter={(value) => value.split(' ')[0]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8490a5', fontSize: 12 }}
                  />
                  
                  <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8490a5', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  
                  <Tooltip
                  formatter={(value, name) => [
                    `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'income' ? 'Income' : 'Expenses',
                  ]}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e8edf5',
                  }}
                  />

                  <Legend />
                  <Bar
                  dataKey="income"
                  name="Income"
                  fill="#4169e1"
                  radius={[5, 5, 0, 0]}
                  />
                  
                  <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
              </ResponsiveContainer>
                </div>
                <div className="chart-footnote">
                  Amounts in INR. Chart uses illustrative sample data.
                </div>
              </article>

              <article className="panel insights-panel">
                <div className="panel-heading">
                  <IconBubble color="yellow">
                    <Lightbulb size={23} />
                  </IconBubble>
                  <div><h2>Spending Insights</h2></div>
                </div>

                <button
                  type="button"
                  className="insight-row"
                  onClick={() => {
                    setSearch('Food');
                    setActivePage('Transactions');
                  }}
                >
                  <IconBubble color="orange" size="large">
                    <Utensils size={26} />
                  </IconBubble>
                  <div className="insight-copy">
                    <small>Explore a category</small>
                    <strong>Food &amp; Dining</strong>
                    <span>Filter your transactions</span>
                  </div>
                  <ChevronRight className="chevron" />
                </button>

                <button
                  type="button"
                  className="insight-row"
                  onClick={() => setActivePage('Budgets')}
                >
                  <IconBubble color="lime" size="large">
                    <PiggyBank size={28} />
                  </IconBubble>
                  <div className="insight-copy">
                    <small>Income minus expenses</small>
                    <strong>Monthly savings</strong>
                    <b className="savings">{money(totals.balance)}</b>
                  </div>
                  <ChevronRight className="chevron" />
                </button>

                <div className="encouragement">
                  <Target size={39} />
                  <div>
                    <strong>Build healthy money habits!</strong>
                    <p>Keep tracking your income and expenses.</p>
                  </div>
                  <div className="mini-bars">
                    <span /><span /><span /><TrendingUp size={24} />
                  </div>
                </div>
              </article>
            </section>

            <section className="panel transactions-panel">
              <div className="transactions-heading">
                <div className="panel-heading">
                  <IconBubble color="periwinkle">
                    <Clock3 size={22} />
                  </IconBubble>
                  <div>
                    <h2>Recent Transactions</h2>
                    <p>Latest activity for the selected month</p>
                  </div>
                </div>
                <div className="transaction-actions">
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => setShowModal(true)}
                  >
                    <Plus size={16} /> Add
                  </button>
                  <button
                    type="button"
                    className="export-button"
                    onClick={exportCSV}
                    title="Export transactions to CSV"
                  >
                    <Download size={17} />
                  </button>
                  <button
                    type="button"
                    className="view-all"
                    onClick={() => setActivePage('Transactions')}
                  >
                    View All <ChevronRight size={17} />
                  </button>
                </div>
              </div>
              <TransactionList limit={5} />
            </section>
          </>
        )}

        {activePage === 'Transactions' && (
          <section className="panel transactions-panel page-panel">
            <div className="transactions-heading">
              <div className="panel-heading">
                <IconBubble color="periwinkle"><Clock3 size={22} /></IconBubble>
                <div>
                  <h2>All Transactions</h2>
                  <p>Add, search, export, or delete transactions</p>
                </div>
              </div>
              <div className="transaction-actions">
                <label className="search-box">
                  <Search size={16} />
                  <input
                    placeholder="Search transactions"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="add-button"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={16} /> Add
                </button>
                <button
                  type="button"
                  className="export-button"
                  onClick={exportCSV}
                  title="Export transactions to CSV"
                >
                  <Download size={17} />
                </button>
              </div>
            </div>
            <TransactionList />
          </section>
        )}

        {activePage === 'Budgets' && (
          <section className="panel page-panel">
            <div className="panel-heading">
              <IconBubble color="purple"><Target size={22} /></IconBubble>
              <div>
                <h2>Monthly Budget</h2>
                <p>Set a spending limit for the selected month</p>
              </div>
            </div>
            <div className="budget-overview">
              <p>Budget limit</p>
              <h2>{money(totals.budget)}</h2>
              <p>Spent: <strong>{money(totals.expenses)}</strong></p>
              <p>Remaining: <strong>{money(totals.remaining)}</strong></p>
              <div className="progress-track">
                <span style={{
                  width: `${Math.min(100, Math.max(
                    0, totals.expenses / totals.budget * 100
                  ))}%`
                }} />
              </div>
              <p>{Math.round(Math.min(100, Math.max(
                0, totals.expenses / totals.budget * 100
              )))}% of your budget used</p>
              <form
                className="budget-form"
                onSubmit={event => {
                  event.preventDefault();
                  changeBudget(event.currentTarget.elements.budget.value);
                }}
              >
                <label htmlFor="budget">New monthly budget (₹)</label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={monthlyBudget}
                  required
                />
                <button type="submit" className="primary-button">
                  Save budget
                </button>
              </form>
            </div>
          </section>
        )}

        {activePage === 'Reports' && (
          <>
            <section className="summary-grid">
              <article className="summary-card income-card">
                <div className="card-label">Income</div>
                <div className="big-number">{money(totals.income)}</div>
              </article>
              <article className="summary-card expense-card">
                <div className="card-label">Expenses</div>
                <div className="big-number">{money(totals.expenses)}</div>
              </article>
              <article className="summary-card balance-card">
                <div className="card-label">Net Balance</div>
                <div className="big-number">{money(totals.balance)}</div>
              </article>
            </section>
            <section className="panel page-panel">
              <div className="panel-heading">
                <IconBubble color="purple">
                  <ChartNoAxesColumn size={22} />
                </IconBubble>
                <div>
                  <h2>Monthly Report</h2>
                  <p>Transactions saved for {month}</p>
                </div>
              </div>
              <div className="report-row">
                <span>Total income</span><strong>{money(totals.income)}</strong>
              </div>
              <div className="report-row">
                <span>Total expenses</span><strong>{money(totals.expenses)}</strong>
              </div>
              <div className="report-row">
                <span>Net balance</span><strong>{money(totals.balance)}</strong>
              </div>
              <div className="report-row">
                <span>Budget remaining</span><strong>{money(totals.remaining)}</strong>
              </div>
              <button
                type="button"
                className="export-button"
                onClick={exportCSV}
              >
                <Download size={17} /> Export report data (CSV)
              </button>
            </section>
          </>
        )}

        {activePage === 'Settings' && (
          <section className="panel page-panel">
            <div className="panel-heading">
              <IconBubble color="blue"><Settings size={22} /></IconBubble>
              <div>
                <h2>Settings</h2>
                <p>Manage your FinanceFlow demo data</p>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <strong>Currency</strong>
                <p>All displayed amounts use Indian rupees (INR).</p>
              </div>
              <span className="type-pill">INR ₹</span>
            </div>
            <div className="settings-row">
              <div>
                <strong>Monthly budget</strong>
                <p>Current limit: {money(monthlyBudget)}</p>
              </div>
              <button
                type="button"
                className="view-all"
                onClick={() => setActivePage('Budgets')}
              >
                Edit budget <ChevronRight size={17} />
              </button>
            </div>
            <div className="settings-row">
              <div>
                <strong>Stored transactions</strong>
                <p>{transactions.length} transaction(s) saved in this browser.</p>
              </div>
              <button
                type="button"
                className="export-button"
                onClick={exportCSV}
              >
                <Download size={17} /> Export
              </button>
            </div>
            <p className="chart-footnote">
              This demo stores data locally in your browser; it does not use an online server.
            </p>
          </section>
        )}

        <footer className="app-footer">
          FinanceFlow · Personal Finance Dashboard
          <span>Demo data is stored locally in your browser.</span>
        </footer>
      </main>


{activeDrawer && (
  <div
    className="drawer-backdrop"
    onClick={event => {
      if (event.target === event.currentTarget) {
        setActiveDrawer(null);
      }
    }}
  >
    <aside
      className="side-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={
        activeDrawer === 'profile' ? 'Edit profile' : 'Notifications'
      }
    >
      <div className="drawer-header">
        <div>
          <h2>
            {activeDrawer === 'profile' ? 'My Profile' : 'Notifications'}
          </h2>
          <p>
            {activeDrawer === 'profile'
              ? 'Update your personal details'
              : 'Your recent account activity'}
          </p>
        </div>

        <button
          type="button"
          className="icon-button"
          aria-label="Close panel"
          onClick={() => setActiveDrawer(null)}
        >
          <X size={21} />
        </button>
      </div>

      {activeDrawer === 'notifications' && (
        <div className="drawer-content">
          <div className="notification-item">
            <IconBubble color="green">
              <ArrowUpRight size={22} />
            </IconBubble>
            <div>
              <strong>Income and expenses</strong>
              <p>
                You have recorded {money(totals.income)} in income and{' '}
                {money(totals.expenses)} in expenses for {month}.
              </p>
              <small>Based on your saved transactions</small>
            </div>
          </div>

          <div className="notification-item">
            <IconBubble color="purple">
              <Target size={22} />
            </IconBubble>
            <div>
              <strong>Budget update</strong>
              <p>
                {totals.remaining < 0
                  ? `You have exceeded your budget by ${money(Math.abs(totals.remaining))}.`
                  : `${money(totals.remaining)} remains in your monthly budget.`}
              </p>
              <small>Budget summary</small>
            </div>
          </div>

          <div className="notification-item">
            <IconBubble color="blue">
              <Wallet size={22} />
            </IconBubble>
            <div>
              <strong>Keep tracking</strong>
              <p>
                You have {transactions.length} transaction(s) saved.
                Continue recording activity to keep your dashboard updated.
              </p>
              <small>Account activity</small>
            </div>
          </div>

          <button
            type="button"
            className="primary-button drawer-action"
            onClick={() => {
              setActiveDrawer(null);
              setActivePage('Transactions');
            }}
          >
            View transactions
          </button>
        </div>
      )}

      {activeDrawer === 'profile' && (
        <form
          className="drawer-content profile-form"
          onSubmit={event => {
            event.preventDefault();

            const updatedProfile = {
              name: profileForm.name.trim(),
              email: profileForm.email.trim(),
              phone: profileForm.phone.trim(),
              occupation: profileForm.occupation.trim()
            };

            if (!updatedProfile.name) {
              notify('Please enter your name.');
              return;
            }

            try {
              localStorage.setItem(
                'financeflow-profile',
                JSON.stringify(updatedProfile)
              );

              setProfile(updatedProfile);
              setProfileForm(updatedProfile);
              setActiveDrawer(null);
              notify('Profile updated successfully.');
            } catch {
              notify('Could not save your profile.');
            }
          }}
        >
          <div className="profile-avatar-large">
            <UserRound size={38} />
          </div>

          <p className="profile-hint">
            Edit your details below and save your changes.
          </p>

          <label>
            Full name
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={event =>
                setProfileForm({
                  ...profileForm,
                  name: event.target.value
                })
              }
              placeholder="Enter your name"
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={profileForm.email}
              onChange={event =>
                setProfileForm({
                  ...profileForm,
                  email: event.target.value
                })
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              value={profileForm.phone}
              onChange={event =>
                setProfileForm({
                  ...profileForm,
                  phone: event.target.value
                })
              }
              placeholder="Enter phone number"
            />
          </label>

          <label>
            Occupation
            <input
              type="text"
              value={profileForm.occupation}
              onChange={event =>
                setProfileForm({
                  ...profileForm,
                  occupation: event.target.value
                })
              }
              placeholder="e.g. Student"
            />
          </label>

          <div className="drawer-form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setActiveDrawer(null)}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              Save profile
            </button>
          </div>
        </form>
      )}
    </aside>
  </div>
)}

      {showModal && (
        <div
          className="modal-backdrop"
          onClick={event => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <form className="transaction-modal" onSubmit={addTransaction}>
            <div className="modal-heading">
              <div>
                <h2>Add transaction</h2>
                <p>Record income or an expense.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Description
              <input
                autoFocus
                required
                value={form.title}
                onChange={event =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. Internet bill"
              />
            </label>

            <div className="form-grid">
              <label>
                Amount (₹)
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={event =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  placeholder="0"
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={event =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Type
                <select
                  value={form.type}
                  onChange={event =>
                    setForm({ ...form, type: event.target.value })
                  }
                >
                  <option>Expense</option>
                  <option>Income</option>
                </select>
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={event =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Save transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast">✓ &nbsp;{toast}</div>}
    </div>
  );
}