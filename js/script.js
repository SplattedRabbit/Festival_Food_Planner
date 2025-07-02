import { mealOptions, secondaryOptions } from "./datasets/datasets.js";
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
window.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("meal-planner-container");
    if (!container)
        return;
    try {
        const response = await fetch("../src/components/meal-planner.html");
        if (!response.ok)
            throw new Error("Failed to load meal planner");
        container.innerHTML = await response.text();
        console.log("Meal planner loaded successfully.");
        initializeDropdowns();
    }
    catch (error) {
        console.error("Error loading meal planner:", error);
    }
});
