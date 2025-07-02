import {mealOptions, secondaryOptions} from "./datasets/datasets.js";
import {MealOption} from "./datasets/datasets.js"

// ===============================
// TAB FUNCTIONALITY
// ===============================
function initializeTabs(): void {
    const tabButtons = document.querySelectorAll<HTMLButtonElement>('[data-tab]');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active from all tabs and buttons
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
                (pane as HTMLElement).style.display = 'none';
            });
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Activate target tab and button
            const targetPane = document.getElementById(`${targetTab}-section`);
            if (targetPane) {
                targetPane.classList.add('active');
                (targetPane as HTMLElement).style.display = 'block';
                this.classList.add('active');
            }

            // Trigger events for meal planner components
            if (targetTab === 'meals') {
                document.dispatchEvent(new CustomEvent('mealPlannerActivated'));
            } else if (targetTab === 'snacks') {
                document.dispatchEvent(new CustomEvent('snacksPlannerActivated'));
            }
        });
    });
}

// ===============================
// EXISTING MEAL PLANNER FUNCTIONALITY
// ===============================
function initializeDropdowns(): void {
    const primarySelects = document.querySelectorAll<HTMLSelectElement>('select:not([data-secondary])');
    const secondarySelects = document.querySelectorAll<HTMLSelectElement>('select[data-secondary]');

    primarySelects.forEach((select: HTMLSelectElement) => {
        select.innerHTML = '';
        mealOptions.forEach((option: MealOption) => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });
        select.addEventListener('change', handlePrimaryChange);
    });

    secondarySelects.forEach((select: HTMLSelectElement) => {
        select.innerHTML = '';
        secondaryOptions.forEach((option: MealOption) => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });
        select.addEventListener('change', generateShoppingList);
    });
}

function handlePrimaryChange(event: Event): void {
    const primarySelect = event.target as HTMLSelectElement;
    const container = primarySelect.closest('.dropdown-container') as HTMLElement;
    const secondarySelect = container.querySelector('.secondary-dropdown') as HTMLSelectElement;

    if (primarySelect.value && primarySelect.value !== '' && primarySelect.value !== 'dosenmahlzeit_gross') {
        secondarySelect.style.display = 'block';
    } else {
        secondarySelect.style.display = 'none';
        secondarySelect.selectedIndex = 0; // Reset secondary selection
    }

    generateShoppingList();
}

function generateShoppingList(): void {
    const primarySelects = document.querySelectorAll<HTMLSelectElement>('select:not([data-secondary])');
    const secondarySelects = document.querySelectorAll<HTMLSelectElement>('select[data-secondary]');
    const items: Record<string, number> = {};

    primarySelects.forEach((select: HTMLSelectElement) => {
        if (select.value && select.value !== '') {
            const option = mealOptions.find((opt: MealOption) => opt.value === select.value);
            if (option && option.exclude) return;

            if (select.value === 'bratkartoffeln') {
                items['Bratkartoffeln'] = (items['Bratkartoffeln'] || 0) + 1;
                items['Baked Beans'] = (items['Baked Beans'] || 0) + 1;
            } else {
                const text = select.options[select.selectedIndex].text;
                items[text] = (items[text] || 0) + 1;
            }
        }
    });

    secondarySelects.forEach((select: HTMLSelectElement) => {
        if (select.value && select.value !== '' && select.style.display !== 'none') {
            const text = select.options[select.selectedIndex].text;
            items[text] = (items[text] || 0) + 1;
        }
    });

    const shoppingList = document.getElementById('shoppingList') as HTMLElement;
    const shoppingItems = document.getElementById('shoppingItems') as HTMLElement;

    if (Object.keys(items).length === 0) {
        shoppingItems.innerHTML = '';
        return;
    }

    shoppingItems.innerHTML = '';
    Object.entries(items).forEach(([item, count]: [string, number]) => {
        const div = document.createElement('div');
        div.className = 'shopping-item';
        div.innerHTML = `<span class="checkbox"></span>${count > 1 ? count + 'x ' : ''}${item}`;
        shoppingItems.appendChild(div);
    });
    shoppingList.style.display = 'block';
}

function exportToPDF(): void {
    generateShoppingList();
    window.print();
}

function clearAll(): void {
    const allSelects = document.querySelectorAll<HTMLSelectElement>('select');
    allSelects.forEach((select: HTMLSelectElement) => {
        select.selectedIndex = 0;
    });

    const secondarySelects = document.querySelectorAll<HTMLSelectElement>('.secondary-dropdown');
    secondarySelects.forEach((select: HTMLSelectElement) => {
        select.style.display = 'none';
    });

    const shoppingItems = document.getElementById('shoppingItems') as HTMLElement;
    shoppingItems.innerHTML = '';  // Clear shopping list content
}

function attachButtonListeners() {
    const exportButton = document.getElementById('exportPdfButton');
    if (exportButton) {
        exportButton.addEventListener('click', exportToPDF);
        console.log("Export PDF button listener attached.");
    } else {
        console.warn("Export PDF button not found. Make sure its ID is 'exportPdfButton'.");
    }

    const clearButton = document.getElementById('clearAllButton');
    if (clearButton) {
        clearButton.addEventListener('click', clearAll);
        console.log("Clear All button listener attached.");
    }
}

// ===============================
// INITIALIZATION
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
    // Initialize tab functionality
    initializeTabs();

    // Event listeners for tab activation
    document.addEventListener('mealPlannerActivated', function() {
        console.log('Mahlzeiten tab activated - meal planner ready');
    });

    document.addEventListener('snacksPlannerActivated', function() {
        console.log('Snacks tab activated - snacks planner ready');
    });

    // Load meal planner component
    const container = document.getElementById("meal-planner-container");
    if (!container) return;

    try {
        const response = await fetch("components/meal-planner.html");
        if (!response.ok) throw new Error("Failed to load meal planner");
        container.innerHTML = await response.text();

        console.log("Meal planner loaded successfully.");
        initializeDropdowns();
        attachButtonListeners();
    } catch (error) {
        console.error("Error loading meal planner:", error);
    }
});