import { mealOptions, secondaryOptions } from "./datasets/datasets.js";
function initializeTabs() {
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
                pane.style.display = 'none';
            });
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            const targetPane = document.getElementById(`${targetTab}-section`);
            if (targetPane) {
                targetPane.classList.add('active');
                targetPane.style.display = 'block';
                this.classList.add('active');
            }
            if (targetTab === 'meals') {
                document.dispatchEvent(new CustomEvent('mealPlannerActivated'));
            }
            else if (targetTab === 'snacks') {
                document.dispatchEvent(new CustomEvent('snacksPlannerActivated'));
            }
        });
    });
}
function initializeDropdowns() {
    const primarySelects = document.querySelectorAll('select:not([data-secondary])');
    const secondarySelects = document.querySelectorAll('select[data-secondary]');
    primarySelects.forEach((select) => {
        select.innerHTML = '';
        mealOptions.forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });
        select.addEventListener('change', handlePrimaryChange);
    });
    secondarySelects.forEach((select) => {
        select.innerHTML = '';
        secondaryOptions.forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });
        select.addEventListener('change', generateShoppingList);
    });
}
function handlePrimaryChange(event) {
    const primarySelect = event.target;
    const container = primarySelect.closest('.dropdown-container');
    const secondarySelect = container.querySelector('.secondary-dropdown');
    if (primarySelect.value && primarySelect.value !== '' && primarySelect.value !== 'dosenmahlzeit_gross') {
        secondarySelect.style.display = 'block';
    }
    else {
        secondarySelect.style.display = 'none';
        secondarySelect.selectedIndex = 0;
    }
    generateShoppingList();
}
function generateShoppingList() {
    const primarySelects = document.querySelectorAll('select:not([data-secondary])');
    const secondarySelects = document.querySelectorAll('select[data-secondary]');
    const items = {};
    primarySelects.forEach((select) => {
        if (select.value && select.value !== '') {
            const option = mealOptions.find((opt) => opt.value === select.value);
            if (option && option.exclude)
                return;
            if (select.value === 'bratkartoffeln') {
                items['Bratkartoffeln'] = (items['Bratkartoffeln'] || 0) + 1;
                items['Baked Beans'] = (items['Baked Beans'] || 0) + 1;
            }
            else {
                const text = select.options[select.selectedIndex].text;
                items[text] = (items[text] || 0) + 1;
            }
        }
    });
    secondarySelects.forEach((select) => {
        if (select.value && select.value !== '' && select.style.display !== 'none') {
            const text = select.options[select.selectedIndex].text;
            items[text] = (items[text] || 0) + 1;
        }
    });
    const shoppingList = document.getElementById('shoppingList');
    const shoppingItems = document.getElementById('shoppingItems');
    if (Object.keys(items).length === 0) {
        shoppingItems.innerHTML = '';
        return;
    }
    shoppingItems.innerHTML = '';
    Object.entries(items).forEach(([item, count]) => {
        const div = document.createElement('div');
        div.className = 'shopping-item';
        div.innerHTML = `<span class="checkbox"></span>${count > 1 ? count + 'x ' : ''}${item}`;
        shoppingItems.appendChild(div);
    });
    shoppingList.style.display = 'block';
}
function exportToPDF() {
    generateShoppingList();
    window.print();
}
function clearAll() {
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach((select) => {
        select.selectedIndex = 0;
    });
    const secondarySelects = document.querySelectorAll('.secondary-dropdown');
    secondarySelects.forEach((select) => {
        select.style.display = 'none';
    });
    const shoppingItems = document.getElementById('shoppingItems');
    shoppingItems.innerHTML = '';
}
function attachButtonListeners() {
    const exportButton = document.getElementById('exportPdfButton');
    if (exportButton) {
        exportButton.addEventListener('click', exportToPDF);
        console.log("Export PDF button listener attached.");
    }
    else {
        console.warn("Export PDF button not found. Make sure its ID is 'exportPdfButton'.");
    }
    const clearButton = document.getElementById('clearAllButton');
    if (clearButton) {
        clearButton.addEventListener('click', clearAll);
        console.log("Clear All button listener attached.");
    }
}
window.addEventListener("DOMContentLoaded", async () => {
    initializeTabs();
    document.addEventListener('mealPlannerActivated', function () {
        console.log('Mahlzeiten tab activated - meal planner ready');
    });
    document.addEventListener('snacksPlannerActivated', function () {
        console.log('Snacks tab activated - snacks planner ready');
    });
    const container = document.getElementById("meal-planner-container");
    if (!container)
        return;
    try {
        const response = await fetch("components/meal-planner.html");
        if (!response.ok)
            throw new Error("Failed to load meal planner");
        container.innerHTML = await response.text();
        console.log("Meal planner loaded successfully.");
        initializeDropdowns();
        attachButtonListeners();
    }
    catch (error) {
        console.error("Error loading meal planner:", error);
    }
});
