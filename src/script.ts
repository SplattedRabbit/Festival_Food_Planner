interface MealOption {
    value: string;
    text: string;
    exclude?: boolean;
}

const mealOptions: MealOption[] = [
    { value: '', text: '-- Auswählen --' },
    { value: 'infield_food', text: 'Infield Food', exclude: true },
    { value: 'dosenmahlzeit_gross', text: 'Dosenmahlzeit (groß)' },
    { value: 'dosenmahlzeit_klein', text: 'Dosenmahlzeit (klein)' },
    { value: 'instantnudeln_gross', text: 'Instantnudeln (groß)' },
    { value: 'instantnudeln_klein', text: 'Instantnudeln (klein)' },
    { value: 'bratkartoffeln', text: 'Bratkartoffeln' },
    { value: 'chips', text: 'Chips' },
    { value: 'nuesse', text: 'Nüsse' },
    { value: 'kekse', text: 'Kekse' },
    { value: 'proteinbars', text: 'Proteinbars' }
];

const secondaryOptions: MealOption[] = [
    { value: '', text: '-- Zusätzliche Auswahl --' },
    { value: 'infield_food', text: 'Infield Food', exclude: true },
    { value: 'dosenmahlzeit_gross', text: 'Dosenmahlzeit (groß)' },
    { value: 'dosenmahlzeit_klein', text: 'Dosenmahlzeit (klein)' },
    { value: 'instantnudeln_gross', text: 'Instantnudeln (groß)' },
    { value: 'instantnudeln_klein', text: 'Instantnudeln (klein)' },
    { value: 'bratkartoffeln', text: 'Bratkartoffeln' },
    { value: 'chips', text: 'Chips' },
    { value: 'nuesse', text: 'Nüsse' },
    { value: 'kekse', text: 'Kekse' },
    { value: 'proteinbars', text: 'Proteinbars' }
];

function initializeDropdowns(): void {
    const primarySelects = document.querySelectorAll<HTMLSelectElement>('select:not([data-secondary])');
    const secondarySelects = document.querySelectorAll<HTMLSelectElement>('select[data-secondary]');

    // Initialize primary dropdowns
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

    // Initialize secondary dropdowns
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

    // Show/hide secondary dropdown based on selection
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

    // Process primary selections
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

    // Process secondary selections
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

    // Hide all secondary dropdowns
    const secondarySelects = document.querySelectorAll<HTMLSelectElement>('.secondary-dropdown');
    secondarySelects.forEach((select: HTMLSelectElement) => {
        select.style.display = 'none';
    });

    const shoppingItems = document.getElementById('shoppingItems') as HTMLElement;
    shoppingItems.innerHTML = '';  // Clear shopping list content
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDropdowns);