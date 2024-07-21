

document.addEventListener('DOMContentLoaded', () => {
    const incomeForm = document.getElementById('incomeForm');
    const expenseForm = document.getElementById('expenseForm');
    const transactionsDiv = document.getElementById('transactions');
    const themeSwitcher = document.getElementById('themeSwitcher');
    const totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
    const totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
    const incomeChartCanvas = document.getElementById('incomeChart').getContext('2d');
    const expenseChartCanvas = document.getElementById('expenseChart').getContext('2d');
    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');


    let transactions = [];
    let incomeChart;
    let expenseChart;
    let currentDate = new Date();

    document.getElementById('openFormBtn').addEventListener('click', function () {
        document.getElementById('formPopup').style.display = 'block';
        document.getElementById('transactionList').style.filter = 'blur(5px)';
    });

    document.getElementById('closeFormBtn').addEventListener('click', function () {
        document.getElementById('formPopup').style.display = 'none';
        document.getElementById('transactionList').style.filter = 'none';
    });

    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const transaction = {
            id: Date.now(),
            type: 'Income',
            date: incomeForm.incomeDate.value,
            amount: parseFloat(incomeForm.incomeAmount.value),
            category: incomeForm.incomeCategory.value.toLowerCase(),
            title: incomeForm.incomeTitle.value,
            note: incomeForm.incomeNote.value,
            //   currency: incomeForm.incomeCurrency.value.toLowerCase(),

        };
        transactions.push(transaction);
        saveTransactions();
        incomeForm.reset();
        document.getElementById('formPopup').style.display = 'none';
        document.getElementById('transactionList').style.filter = 'none';
        renderTransactions();
    });

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const transaction = {
            id: Date.now(),
            type: 'Expense',
            date: expenseForm.expenseDate.value,
            amount: parseFloat(expenseForm.expenseAmount.value),
            category: expenseForm.expenseCategory.value,
            title: expenseForm.expenseTitle.value,
            note: expenseForm.expenseNote.value,
            //   currency: expenseForm.expenseCurrency.value.toLowerCase(),
            
        };

        transactions.push(transaction);
        saveTransactions();
        expenseForm.reset();
        document.getElementById('formPopup').style.display = 'none';
        document.getElementById('transactionList').style.filter = 'none';
        renderTransactions();
    });

    const saveTransactions = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    const loadTransactions = () => {
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
        }
    };

    const groupTransactionsByDate = (transactions) => {
        return transactions.reduce((groups, transaction) => {
            const date = transaction.date;
            if (!groups[date]) {
                groups[date] = { income: 0, expense: 0, transactions: [] };
            }
            if (transaction.type === 'Income') {
                groups[date].income += transaction.amount;
            } else {
                groups[date].expense += transaction.amount;
            }
            groups[date].transactions.push(transaction);
            return groups;
        }, {});
    };

    const calculateMonthlyTotals = () => {
        let totalIncome = 0;
        let totalExpenses = 0;
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            if (transactionDate.getMonth() === currentDate.getMonth() && transactionDate.getFullYear() === currentDate.getFullYear()) {
                if (transaction.type === 'Income') {
                    totalIncome += transaction.amount;
                } else {
                    totalExpenses += transaction.amount;
                }
            }
        });
        return { totalIncome, totalExpenses };
    };

    const getMonthlyIncomeData = () => {
        const incomeData = {};
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            if (transaction.type === 'Income' && transactionDate.getMonth() === currentDate.getMonth() && transactionDate.getFullYear() === currentDate.getFullYear()) {
                if (!incomeData[transaction.category]) {
                    incomeData[transaction.category] = 0;
                }
                incomeData[transaction.category] += transaction.amount;
            }
        });
        return incomeData;
    };

    const getMonthlyExpenseData = () => {
        const expenseData = {};
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            if (transaction.type === 'Expense' && transactionDate.getMonth() === currentDate.getMonth() && transactionDate.getFullYear() === currentDate.getFullYear()) {
                if (!expenseData[transaction.category]) {
                    expenseData[transaction.category] = 0;
                }
                expenseData[transaction.category] += transaction.amount;
            }
        });
        return expenseData;
    };

    const renderCharts = () => {
        const incomeData = getMonthlyIncomeData();
        const expenseData = getMonthlyExpenseData();

        const incomeLabels = Object.keys(incomeData);
        const incomeAmounts = Object.values(incomeData);

        const expenseLabels = Object.keys(expenseData);
        const expenseAmounts = Object.values(expenseData);

        if (incomeChart) {
            incomeChart.destroy();
        }
        if (expenseChart) {
            expenseChart.destroy();
        }

        incomeChart = new Chart(incomeChartCanvas, {
            type: 'pie',
            data: {
                labels: incomeLabels,
                datasets: [{
                    data: incomeAmounts,
                    backgroundColor: [
                        'rgb(255, 136, 10)',
                        'rgb(255, 208, 0)',
                    ],
                    borderColor: [
                        'rgb(255, 136, 10)',
                        'rgb(255, 208, 0)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });

        expenseChart = new Chart(expenseChartCanvas, {
            type: 'pie',
            data: {
                labels: expenseLabels,
                datasets: [{
                    data: expenseAmounts,
                    backgroundColor: [
                        'rgb(255, 208, 0)',
                        'rgb(47, 205, 110)',
                        'rgb(0, 190, 215)',
                        'rgb(255, 136, 10)',
                        'rgb(235, 0, 129)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgb(255, 208, 0)',
                        'rgb(47, 205, 110)',
                        'rgb(0, 190, 215)',
                        'rgb(255, 136, 10)',
                        'rgb(235, 0, 129)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    };


    const renderTransactions = () => {
        transactionsDiv.innerHTML = '';
        const groupedTransactions = groupTransactionsByDate(transactions);
        const filteredTransactions = Object.keys(groupedTransactions).filter(date => {
            const transactionDate = new Date(date);
            return transactionDate.getMonth() === currentDate.getMonth() && transactionDate.getFullYear() === currentDate.getFullYear();
        }).reduce((obj, key) => {
            obj[key] = groupedTransactions[key];
            return obj;
        }, {});

        for (const date in filteredTransactions) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'transaction-date';

            const totalIncome = filteredTransactions[date].income.toFixed(2);
            const totalExpense = filteredTransactions[date].expense.toFixed(2);
            dateDiv.innerHTML = `
            <div class="die">
             <span> ${date}  </span>
             <span id="in"> Total Income: $${totalIncome}  </span>
             <span id="ex"> Total Expense: $${totalExpense} </span>
            </div>
            `;

            const transactionBox = document.createElement('div');
            transactionBox.className = 'transaction-box';

            filteredTransactions[date].transactions.forEach(transaction => {
                const div = document.createElement('div');
                div.className = `transaction-item ${transaction.category}`;
                div.innerHTML = `
          <div class="catg">
            <span>${transaction.category}</span>
          </div>
          <div>
            <span>${transaction.title}</span>
          </div>
          <div>
            <span>${transaction.note}</sapn>
          </div>
          <div class="amt">
            <span>${transaction.amount.toFixed(2)}</span>
          </div>
          <button onclick="removeTransaction(${transaction.id})"> <i class="fa fa-trash delete-icon" aria-hidden="true"></i></button>
        `;
                transactionBox.appendChild(div);
            });
            dateDiv.appendChild(transactionBox);
            transactionsDiv.appendChild(dateDiv);
        }
        const { totalIncome, totalExpenses } = calculateMonthlyTotals();
        totalIncomeDisplay.textContent = totalIncome.toFixed(2);
        totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
        renderCharts();
    };

    window.removeTransaction = (id) => {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveTransactions();
        alert('You want to remove transaction');
        renderTransactions();
    };


    themeSwitcher.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeSwitcher.textContent = document.body.classList.contains('dark-mode') ? 'Switch to Light Them' : 'Switch to Dark Theme';
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateMonthDisplay();
        renderTransactions();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateMonthDisplay();
        renderTransactions();
    });

    const updateMonthDisplay = () => {
        const options = { year: 'numeric', month: 'long' };
        currentMonthDisplay.textContent = currentDate.toLocaleDateString(undefined, options);
    };

    loadTransactions();
    updateMonthDisplay();
    renderTransactions();
});

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

