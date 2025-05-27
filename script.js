class Calculator {
    constructor() {
        this.previousOperandElement = document.querySelector('.previous-operand');
        this.currentOperandElement = document.querySelector('.current-operand');
        this.clear();
        
        // Magic mode variables
        this.isMagicMode = false;
        this.magicResult = 0;
        this.percentPressCount = 0;
        this.percentPressTimeout = null;
        this.isPopupActive = false;
        
        // Initialize event listeners
        this.initializeEventListeners();
        this.initializeKeyboardListeners();
        this.initializeInstructionButton();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand.toString() + number;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        // If in magic mode and equals is pressed, show magic result
        if (this.isMagicMode && this.operation === '=') {
            this.currentOperand = this.magicResult.toString();
            this.previousOperand = '';
            this.operation = undefined;
            this.updateDisplay();
            this.launchConfetti();
            this.resetMagicMode();
            return;
        }

        // Normal calculation
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }

        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '0';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    handlePercentPress() {
        this.percentPressCount++;
        
        // Clear any existing timeout
        if (this.percentPressTimeout) {
            clearTimeout(this.percentPressTimeout);
        }
        
        // Set a new timeout to reset the count after 2 seconds
        this.percentPressTimeout = setTimeout(() => {
            this.percentPressCount = 0;
        }, 2000);

        // Check if we've reached 5 presses
        if (this.percentPressCount === 5) {
            this.activateMagicMode();
        }
    }

    activateMagicMode() {
        const popup = document.getElementById('magicPopup');
        const resultInput = document.getElementById('result');
        popup.classList.add('active');
        this.isPopupActive = true;
        
        // Focus the input field
        resultInput.focus();
        
        // Handle Enter key in popup
        resultInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById('startMagic').click();
            }
        });

        document.getElementById('startMagic').addEventListener('click', () => {
            const result = parseInt(resultInput.value);
            this.magicResult = result;
            this.isMagicMode = true;
            popup.classList.remove('active');
            this.isPopupActive = false;
            this.clear();
        });
    }

    resetMagicMode() {
        this.isMagicMode = false;
        this.magicResult = 0;
        this.percentPressCount = 0;
    }

    launchConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.innerText);
                this.updateDisplay();
            });
        });

        // Operator buttons
        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                
                if (action === 'percent') {
                    this.handlePercentPress();
                }

                switch (action) {
                    case 'clear':
                        this.clear();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                    case 'equals':
                        this.operation = '=';
                        this.compute();
                        break;
                    default:
                        this.chooseOperation(button.innerText);
                }
                this.updateDisplay();
            });
        });
    }

    initializeKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            // Don't handle calculator keys if popup is active
            if (this.isPopupActive) return;

            // Prevent default behavior for calculator keys
            if (this.isCalculatorKey(event.key)) {
                event.preventDefault();
            }

            // Handle number keys (0-9 and decimal)
            if (/^[0-9.]$/.test(event.key)) {
                this.appendNumber(event.key);
                this.updateDisplay();
            }

            // Handle operator keys
            switch (event.key) {
                case '+':
                    this.chooseOperation('+');
                    this.updateDisplay();
                    break;
                case '-':
                    this.chooseOperation('-');
                    this.updateDisplay();
                    break;
                case '*':
                    this.chooseOperation('×');
                    this.updateDisplay();
                    break;
                case '/':
                    this.chooseOperation('÷');
                    this.updateDisplay();
                    break;
                case '%':
                    this.handlePercentPress();
                    this.chooseOperation('%');
                    this.updateDisplay();
                    break;
                case 'Enter':
                    if (this.previousOperand !== '') {
                        this.operation = '=';
                        this.compute();
                        this.updateDisplay();
                    }
                    break;
                case 'Escape':
                    this.clear();
                    this.updateDisplay();
                    break;
                case 'Backspace':
                    this.delete();
                    this.updateDisplay();
                    break;
            }
        });
    }

    isCalculatorKey(key) {
        return /^[0-9.]$/.test(key) || // Numbers and decimal
               ['+', '-', '*', '/', '%', 'Enter', 'Escape', 'Backspace'].includes(key);
    }

    initializeInstructionButton() {
        const instructionBtn = document.getElementById('instructionBtn');
        const instructionPopup = document.getElementById('instructionPopup');
        const closeInstructions = document.getElementById('closeInstructions');

        instructionBtn.addEventListener('click', () => {
            instructionPopup.classList.add('active');
            this.isPopupActive = true;
        });

        closeInstructions.addEventListener('click', () => {
            instructionPopup.classList.remove('active');
            this.isPopupActive = false;
        });

        // Close popup when clicking outside
        instructionPopup.addEventListener('click', (e) => {
            if (e.target === instructionPopup) {
                instructionPopup.classList.remove('active');
                this.isPopupActive = false;
            }
        });
    }
}

// Initialize calculator
const calculator = new Calculator(); 