console.log('version 1.0.4');
const circle = document.querySelector('.progressbar__track');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    if (percent > 100) {
        percent = 100;
    }
    const offset = circumference - percent / 100 * circumference;
    circle.style.strokeDashoffset = offset; 
}

var budgetController = (function (){
    
    class Expense {
        constructor(id, description, value, category) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
            this.category = category;
        }
    }
    
    class Income {
        constructor(id, description, value, category) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }
    
    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round( (this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    
    
    // I guess it could be an array but I prefer how this looks
    const categories = {
        0: 'Other',
        1: 'Groceries',
        2: 'Eating out',
        3: 'Transportation',
        4: 'Education',
        5: 'Healthcare',
        6: 'Housing',
        7: 'Fun',
        8: 'Services',
        9: 'Personal care',
        10: 'Online shopping'
    }
    
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
        categoriesTotals: []
    };
    
    
    
    var calculateTotal = type => {
        sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    var calculateCategoryTotal = categoryIndex => {
        let sum = 0;
        let expensesArr = data.allItems.exp;
        expensesArr.forEach((cur) => {
            if (cur.category === categories[categoryIndex]) {
                sum += cur.value;
            }
        });
        return sum;
    }
    
    var getDataToJSON = () => { return JSON.stringify(data.allItems) }
    
    
    
    var getLocalStorage = () => { return JSON.parse(localStorage.data) }
    
    
    return {
        
        
        changeObjectProperty: (id, type, property, newContent) => {
            
            if (property === 'value') {
                let formattedNumb = newContent.split(',').join('').substring(2);
                newContent = parseFloat(formattedNumb);
            }
            
            data.allItems[type][id][property] = newContent;
            console.log(newContent);
            return newContent;
        },
        
        deleteAll: () => {
            data.allItems.exp = [];
            data.allItems.inc = [];
        },
        
        addItem: (type, description, value, categoryIndex) => {
            let newItem, id;
            
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                id = 0;
            }
            
            if (type === 'exp') {
                newItem = new Expense(id, description, value, categories[categoryIndex]);
            } else if (type === 'inc') {
                newItem = new Income(id, description, value);
            }
            
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        calculateCategoriesTotal: () => {
            let numOfCategories = Object.keys(categories).length;
            let categoriesTotals = [];
            for (let i = 0; i < numOfCategories;i++) {
                let sum = calculateCategoryTotal(i);
                categoriesTotals.push(sum);
            }
            data.categoriesTotals = categoriesTotals.slice(0);
            return categoriesTotals;
        },
        
        calculateCategoriesPercentage: totalsArr => {
            let percArr;
            percArr = totalsArr.map(cur => ((cur/data.totals.exp)*100).toFixed(2) );
            return percArr;
        },
        
        
        calculatePercentages: () => {
            data.allItems.exp.forEach(cur => cur.calculatePercentage(data.totals.inc));
        },
        
        getPercentages: () => {
            let allPerc = data.allItems.exp.map(cur => cur.getPercentage());
            return allPerc;
        },
        
        deleteItem: (type, id) => {
            let arr, index;
            arr = data.allItems[type].map(cur => cur.id);
            index = arr.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: () => {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = '---';
            }
            
        },
        
        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        getCategories: function() {
            // idk why I cant return  an object made with assign
            return {
                0: categories[0],
                1: categories[1],
                2: categories[2],
                3: categories[3],
                4: categories[4],
                5: categories[5],
                6: categories[6],
                7: categories[7],
                8: categories[8],
                9: categories[9],
                10: categories[10]
            }
        },
        
        //LOCAL STORAGE FUNCTIONS
        storeDataInLocalStorage: () => {
            localStorage.setItem("data", getDataToJSON());
        },
        
        loadLocalStorage: () => {
            if (localStorage.data) {
                return getLocalStorage();
            }
        },
        
        testing: () =>  {
            console.log(data)
        }
        
        
    }
}());

var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton:'.add__btn',
        inputCategory: '.add__category',
        inputContainer: '.add__container',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.main',
        expensesPercentageLabel: '.item__percentage',
        dateLabelMonth: '.budget__title--month',
        dateLabelYear: '.budget__title--year',
        categoriesChart: '.budget__categoryTotals--breakdown',
        categoriesChartContainer: '.budget__catergoryTotals--container',
        categoriesButton: '.budget__contentButton',
        editItemButton: '.item__delete--btn',
        itemContainer: '.item',
        itemValue: '.item__value',
        itemDescription: '.item__description',
        deleteAllButton: '.deleteAll',
    }
    
    
    
    
    
    let formatNumber = (num, type) => {
        let numSplit, dec, int;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        int = parseInt(numSplit[0]).toLocaleString();
        
        dec = numSplit[1];
        
        
        return (type === 'exp' ? '- ' : '+ ') + int + '.' + dec;
    }
    
    let inputValueValidate = (input) => {
        return isNaN(input);
    }
    
    
    return {
        getDOMstrings: () => {
            return DOMstrings;
        },
        
        getInput: () => {
            
            let isInvalid = inputValueValidate(parseFloat(document.querySelector(DOMstrings.inputValue).value));
            
            if (isInvalid === false) {
                return {
                    type: document.querySelector(DOMstrings.inputType).value,
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: Math.abs(parseFloat(document.querySelector(DOMstrings.inputValue).value)),
                    categoryIndex: document.querySelector(DOMstrings.inputCategory).value 
                } 
            } else if ( isInvalid === true) {
                document.querySelector(DOMstrings.inputValue).value = '';
                return false;
            }
            
        },
        
        addListItem: (obj, type) => {
            let html, element;
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item" id="inc-${obj.id}"><div class="left"><div class="item__description" id="description-inc-${obj.id}">${obj.description}</div></div><div class="right"><div class="item__value" id="value-inc-${obj.id}">${formatNumber(obj.value, 'inc')}</div><div class="item__edit"><button class="item__edit--btn"><i class="far fa-edit " id="edit-inc-${obj.id}"></i></button></div><div class="item__delete"><button class="item__delete--btn"><i class="fas fa-times" id="delete-inc-${obj.id}"></i></button></div></div><div class="invalidInput" id="invalid-${obj.id}">Invalid Input</div></div>
                
                
                `;
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
                <div class="left">
                <div class="item__description" id="description-exp-${obj.id}">${obj.description}</div>
                <div class="item__category">${obj.category}</div>
                </div>
                
                <div class="right">
                <div class="item__value" id="value-exp-${obj.id}">${formatNumber(obj.value, 'exp')}</div>
                <div class="item__percentage">21%</div>
                
                <div class="item__edit">
                <button class="item__edit--btn">
                <i class="far fa-edit " id="edit-exp-${obj.id}"></i>
                </button>
                </div>
                
                <div class="item__delete">
                <button class="item__delete--btn"><i class="fas fa-times" id="delete-exp-${obj.id}"></i></button>
                </div>
                </div>
                <div class="invalidInput" id="invalid-${obj.id}">Invalid Input</div>
                </div>`;
            }
            
            document.querySelector(element).insertAdjacentHTML('afterbegin', html); 
            
        },
        
        deleteListItem: (iconId) => {
            let el = document.getElementById(iconId);
            el.parentNode.removeChild(el);
        },
        
        displayBudget: (budgetData) => {
            let type;
            budgetData.budget >= 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budgetData.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budgetData.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(budgetData.totalExp, 'exp');
            
            if (budgetData.percentage > 0) {
                
                document.querySelector(DOMstrings.percentageLabel).textContent = budgetData.percentage + '%';
                
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        deleteAll: () => {
            let allItems = document.querySelectorAll(DOMstrings.itemContainer);
            
            allItems = Array.from(allItems);
            allItems.forEach(cur => cur.remove());
        },
        
        displayMonth: () => {
            
            var formattedDateMonth = new Date().toLocaleDateString('en-US', {
                month: 'long'
            });
            
            var formattedDateYear = new Date().toLocaleString('en-US', {
                year: 'numeric'
            });
            
            document.querySelector(DOMstrings.dateLabelMonth).textContent = formattedDateMonth;
            
            document.querySelector(DOMstrings.dateLabelYear).textContent = ' ' + formattedDateYear;
            
        },
        
        displayProgressBars: (categories ,categoriesPerc, categoriesTotals) => {
            let categoriesLength = Object.keys(categories).length;
            //console.log(categoriesLength);
            //console.log(categories);
            
            document.querySelector(DOMstrings.categoriesChart).innerHTML = '';
            for  (let i = 0; i < categoriesLength; i++) {
                html = `<div class="budget__categoryTotals--category">${categories[i]}</div><div class="budget__categoryTotals--bar"><span style="width: ${categoriesPerc[i]}%"></span></div><div class="budget__categoryTotals--value">$ ${categoriesTotals[i].toFixed(2)}</div>`;
                document.querySelector(DOMstrings.categoriesChart).insertAdjacentHTML('beforeend', html); 
            }
            
            
        },
        
        displayPercentages: (percentageArr) => {
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            // I have to reverse the array bc Im using afterbegin
            let arr = Array.from(fields).reverse();
            arr.forEach((cur, index) => {
                if (percentageArr[index] > 0) {
                    cur.textContent = percentageArr[index] + '%';
                } else {
                    cur.textContent = '---';
                }   
                
            });
        },
        
        makeElementEditable: (element) => {
            element.contentEditable = 'true';
            element.classList.add('editable');
        },
        
        makeElementNotEditable: (element) => {
            element.contentEditable = 'false';
            element.classList.remove('editable');
        },
        
        changeType: () => {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue + ',' + DOMstrings.inputContainer  + ',' + DOMstrings.inputCategory);
                
                let arr = Array.from(fields);
                
                arr.forEach(cur => {
                    cur.classList.toggle('red-focus');
                });
                
                document.querySelector(DOMstrings.inputButton).classList.toggle('red');
                
                
            },
            
            clearFields: () => {
                let list = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
                
                let arr = Array.from(list);
                
                arr.forEach((field) => { 
                    field.value = ''; 
                });
                
                arr[0].focus();
            }
        }
    })();
    
    var controller = (function(budgetCtrl, UICtrl){
        let DOM = UICtrl.getDOMstrings();
        
        var setupEventListeners = function () {
            document.querySelector(DOM.inputButton).addEventListener('click', crtlAddItem);
            
            document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
            
            document.addEventListener('keydown', function(e){
                if (e.keyCode === 13 || e.which === 13) {
                    crtlAddItem();
                } else if (e.keyCode === 39 || e.which === 39){
                    
                    if (document.querySelector(DOM.inputType).selectedIndex === 0) {
                        document.querySelector(DOM.inputType).selectedIndex = 1;
                        UICtrl.changeType();
                    } else {
                        document.querySelector(DOM.inputType).selectedIndex = 0;
                        UICtrl.changeType();
                    }
                }
            });
            
            document.querySelector(DOM.container).addEventListener('click', crtlDeleteItem);
            
            document.querySelector(DOM.categoriesButton).addEventListener('click', () => {
                let container = document.querySelector(DOM.categoriesChartContainer);
                if (!container.classList.contains('forceHeight')){
                    crtlUpdateBreakdown();
                    document.querySelector(DOM.categoriesButton).style.transform = 'rotateZ(-135deg)';
                } else {
                    document.querySelector(DOM.categoriesButton).style.transform = 'rotateZ(45deg)';
                }
                container.classList.toggle('forceHeight');
                
            });
            
            document.querySelector(DOM.container).addEventListener('click', ctrlEditItem);
            
            document.querySelector(DOM.deleteAllButton).addEventListener('click', ctrlDeleteAllItems);
            
        }
        
        var updateBudget = () => {
            budgetCtrl.calculateBudget();
            budget = budgetCtrl.getBudget();
            UICtrl.displayBudget(budget);
            setProgress(budget.percentage);
        }
        
        var updatePercentages = () => {
            // 1. calculate the percentages
            budgetCtrl.calculatePercentages();
            // 2. read percentages from budget controller
            var percentages = budgetCtrl.getPercentages();
            // 3. update the UI
            UICtrl.displayPercentages(percentages);
        }
        
        var crtlAddItem = () => { 
            let input, newItem;
            
            //get input
            input = UICtrl.getInput();
            
            if (input !== false) {
                // add item to budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value, input.categoryIndex);
                // add item to ui
                UICtrl.addListItem(newItem, input.type);
                // calculate budget
                UICtrl.clearFields();
                
                updateBudget(); 
                
                updatePercentages();
                
                budgetCtrl.storeDataInLocalStorage();
                
                budgetCtrl.loadLocalStorage();
            }
            
        }
        
        var getTypeAndId = (string) => {
            let arr, type, id;
            arr = string.split('-');
            type = arr[0];
            id = parseInt(arr[1]);
            return {
                type: type,
                id: id
            }
        }
        
        var crtlDeleteItem = e => {
            let itemID, obj;
            if (e.target.id.includes('delete-')) {
                
                itemID = e.target.id.substring(7);
                
                if (itemID) {
                    obj = getTypeAndId(itemID);
                    budgetCtrl.deleteItem(obj.type, obj.id);
                    UICtrl.deleteListItem(itemID);
                    updateBudget();
                    updatePercentages();
                    budgetCtrl.storeDataInLocalStorage();
                }
            }
            
        }
        
        var ctrlEditItem = e => {
            let itemID, descriptionBox, valueBox, obj;
            
            
            if (e.target.id.includes('edit-')) {
                
                itemID = e.target.id.substring(5);
                
                obj = getTypeAndId(itemID);
                // tornar caixa de descp and value editaveis 
                //id="description-inc-1"
                descriptionBox = document.getElementById(`description-${obj.type}-${obj.id}`);
                valueBox = document.getElementById(`value-${obj.type}-${obj.id}`);
                inputErrorBox = document.getElementById(`invalid-${obj.id}`);
                
                if (e.target.classList.contains('fa-edit')) {
                    UICtrl.makeElementEditable(descriptionBox);
                    UICtrl.makeElementEditable(valueBox);
                    
                    e.target.classList.remove('fa-edit');
                    e.target.classList.add('fa-save');
                } else if (e.target.classList.contains('fa-save')) {
                    newDesc = descriptionBox.textContent;
                    newValue = valueBox.textContent;
                    // tests string for commmas, numbers and periods
                    // user must leave + and space in the left of the new value, hence substring(2)
                    let isValueValid = /^[0-9,.]*$/.test(newValue.substring(2));
                    
                    if (newDesc.length > 25 || isValueValid === false) {
                        // some message box to the user
                        inputErrorBox.style.opacity = "1";
                    }
                    else {
                        inputErrorBox.style.opacity = "0";
                        budgetCtrl.changeObjectProperty(obj.id, obj.type, 'description', newDesc);
                        let signal;
                        obj.type === 'inc' ? signal = '+' : signal = '-';
                        valueBox.innerHTML = signal + ' ' + budgetCtrl.changeObjectProperty(obj.id, obj.type, 'value', valueBox.textContent).toLocaleString();
                        
                        UICtrl.makeElementNotEditable(descriptionBox);
                        UICtrl.makeElementNotEditable(valueBox);
                        
                        
                        updateBudget();
                        updatePercentages();
                        budgetCtrl.storeDataInLocalStorage();
                        
                        e.target.classList.remove('fa-save');
                        e.target.classList.add('fa-edit');
                    }
                    
                }
                
            }
        }
        
        var crtlUpdateBreakdown = () => {
            let catPercArr, crtlCategories;
            //calculate totals for each category -> retornar um objeto
            totalsArr = budgetCtrl.calculateCategoriesTotal();
            
            //calculate percentages 
            catPercArr = budgetCtrl.calculateCategoriesPercentage(totalsArr); // this function returns the perc in string format
            crtlCategories = budgetCtrl.getCategories();
            // create progressbar html elements
            UICtrl.displayProgressBars(crtlCategories , catPercArr, totalsArr);
        }
        
        var ctrlDeleteAllItems = () => {
            budgetCtrl.deleteAll();
            UICtrl.deleteAll();
            updateBudget();
            budgetCtrl.storeDataInLocalStorage();
        }
        
        var setLocalStorageItems = allItems => {
            
            allItems.inc.forEach(cur => {
                
                let newItem = budgetCtrl.addItem('inc', cur.description, cur.value, cur.categoryIndex);
                UICtrl.addListItem(newItem, 'inc');

            });
            
            let categories = {
                0: 'Other',
                1: 'Groceries',
                2: 'Eating out',
                3: 'Transportation',
                4: 'Education',
                5: 'Healthcare',
                6: 'Housing',
                7: 'Fun',
                8: 'Services',
                9: 'Personal care',
                10: 'Online shopping'
            }
            
            
            allItems.exp.forEach((cur, i) => {
                
                let index;
                switch (allItems.exp[i].category) {
                    case 'Other':
                    index = 0;
                    break;

                    case 'Groceries':
                    index = 1;
                    break;

                    case 'Eating out':
                    index = 2;
                    break;

                    case 'Transportation':
                    index = 3;
                    break;

                    case 'Education':
                    index = 4;
                    break;

                    case 'Healthcare':
                    index = 5;
                    break;

                    case 'Housing':
                    index = 6;
                    break;

                    case 'Fun':
                    index = 7;
                    break;

                    case 'Services':
                    index = 8;
                    break;

                    case 'Personal care':
                    index = 9;
                    break;

                    case 'Online shopping':
                    index = 10;
                    break;

                }
                
                
                let newItem = budgetCtrl.addItem('exp', cur.description, cur.value, index);
                
                UICtrl.addListItem(newItem, 'exp');

                updateBudget();
                updatePercentages();
            });
        }
        
        return {
            init: () => {
                setupEventListeners();
                
                let local = budgetCtrl.loadLocalStorage();

                if (local) {
                    setLocalStorageItems(local);
                    crtlUpdateBreakdown();
                }
                
                updateBudget();
                UICtrl.displayMonth();
                UICtrl.clearFields();
            }
        } 
        
        
    }(budgetController, UIController));
    
    controller.init();
    
    
    
    
    
    
    
    