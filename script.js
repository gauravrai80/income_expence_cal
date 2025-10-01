document.addEventListener('DOMContentLoaded', () => {
   
    const transactionForm = document.getElementById('transaction-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeInputs = document.querySelectorAll('input[name="type"]');
    const resetBtn = document.getElementById('reset-btn');
    const transactionsList = document.getElementById('transactions-list');
    const totalIncomeEl = document.getElementById('total-income-amount');
    const totalExpensesEl = document.getElementById('total-expenses-amount');
    const netBalanceEl = document.getElementById('net-balance-amount');
    const filterInputs = document.querySelectorAll('input[name="filter"]');
    
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let isEditing = false;
    let editId = null;



    // CREATE: Add a new transaction
    function addTransaction(e) {
        e.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = document.querySelector('input[name="type"]:checked').value;

        if (description === '' || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid description and a positive amount.');
            return;
        }

        if (isEditing) {
            // UPDATE: Edit an existing transaction
            transactions = transactions.map(t => 
                t.id === editId ? { ...t, description, amount, type } : t
            );
            isEditing = false;
            editId = null;
            document.getElementById('add-btn').innerText = 'Add Transaction';
        } else {
            const newTransaction = {
                id: generateId(),
                description,
                amount,
                type,
                date: new Date().toISOString()
            };
            transactions.push(newTransaction);
        }

        saveTransactions();
        renderTransactions();
        updateBalance();
        clearFields();
    }

    // DELETE: Remove a transaction
    function deleteTransaction(id) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        renderTransactions();
        updateBalance();
    }

    // READ: Render transactions to the DOM
    function renderTransactions() {
        transactionsList.innerHTML = ''; // Clear the list

        const selectedFilter = document.querySelector('input[name="filter"]:checked').value;
        const filteredTransactions = transactions.filter(t => {
            if (selectedFilter === 'all') return true;
            return t.type === selectedFilter;
        });

        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = '<p class="no-entries">No entries found for this filter.</p>';
            return;
        }

        filteredTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.classList.add('transaction-item', transaction.type);
            li.setAttribute('data-id', transaction.id);

            const sign = transaction.type === 'income' ? '+' : '-';
            const amountColorClass = transaction.type === 'income' ? 'income-text' : 'expense-text';
            const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount);

            li.innerHTML = `
                <div class="transaction-details">
                    <span class="description">${transaction.description}</span>
                    <span class="amount ${amountColorClass}">${sign}${formattedAmount}</span>
                </div>
                <div class="actions">
                    <button class="edit-btn" onclick="editTransaction(${transaction.id})">edit</i></button>
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">delete</button>
                </div>
            `;
            transactionsList.appendChild(li);
        });
    }

    // UPDATE: Set up form for editing
    window.editTransaction = (id) => {
        const transactionToEdit = transactions.find(t => t.id === id);
        if (transactionToEdit) {
            descriptionInput.value = transactionToEdit.description;
            amountInput.value = transactionToEdit.amount;
            document.querySelector(`input[name="type"][value="${transactionToEdit.type}"]`).checked = true;
            isEditing = true;
            editId = id;
            document.getElementById('add-btn').innerText = 'Update Transaction';
        }
    };

    // Calculate and update balance summary
    function updateBalance() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netBalance = totalIncome - totalExpenses;

        totalIncomeEl.innerText = `₹${totalIncome.toFixed(2)}`;
        totalExpensesEl.innerText = `₹${totalExpenses.toFixed(2)}`;
        netBalanceEl.innerText = `₹${netBalance.toFixed(2)}`;
    }

    // Generate a unique ID
    function generateId() {
        return Math.floor(Math.random() * 100000000);
    }


    function clearFields() {
        descriptionInput.value = '';
        amountInput.value = '';
        document.querySelector('input[name="type"][value="income"]').checked = true;
    }

    resetBtn.addEventListener('click', () => {
        clearFields();
        isEditing = false;
        editId = null;
        document.getElementById('add-btn').innerText = 'Add Transaction';
    });

    // Save transactions to local storage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }


    // Form submission for adding/updating
    transactionForm.addEventListener('submit', addTransaction);

    // Event delegation for delete buttons
    transactionsList.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const id = parseInt(e.target.closest('.transaction-item').getAttribute('data-id'));
            deleteTransaction(id);
        }
    });

    // Filter change handler
    filterInputs.forEach(input => {
        input.addEventListener('change', renderTransactions);
    });

   
    renderTransactions();
    updateBalance();
});