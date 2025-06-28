class TerrariaRandomizer {
    constructor() {
        this.config = null;
        this.init();
    }

    async init() {
        await this.loadConfig();
        this.setupEventListeners();
        this.updateCheckboxStates();
    }

    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
            console.log('Конфигурация загружена:', this.config);
        } catch (error) {
            console.error('Ошибка загрузки конфигурации:', error);
            this.showError('Не удалось загрузить конфигурацию. Проверьте файл config.json');
        }
    }

    setupEventListeners() {
        const randomizeBtn = document.getElementById('randomizeBtn');
        randomizeBtn.addEventListener('click', () => this.randomize());

        const checkboxes = ['worldSettings', 'characterDifficulty', 'characterClass', 'characterSubclass'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            checkbox.addEventListener('change', () => this.updateCheckboxStates());
        });
    }

    updateCheckboxStates() {
        if (!this.config) return;

        Object.keys(this.config).forEach(key => {
            const checkbox = document.getElementById(key);
            if (checkbox) {
                checkbox.checked = this.config[key].enabled;
            }
        });
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    randomize() {
        if (!this.config) {
            this.showError('Конфигурация не загружена');
            return;
        }

        const results = {
            world: this.randomizeWorld(),
            character: this.randomizeCharacter(),
            class: this.randomizeClass()
        };

        this.displayResults(results);
    }

    randomizeWorld() {
        const checkbox = document.getElementById('worldSettings');
        if (!checkbox.checked || !this.config.worldSettings.enabled) {
            return null;
        }

        const worldConfig = this.config.worldSettings;
        return {
            size: this.getRandomElement(worldConfig.sizes),
            difficulty: this.getRandomElement(worldConfig.difficulties),
            corruption: this.getRandomElement(worldConfig.corruptions)
        };
    }

    randomizeCharacter() {
        const checkbox = document.getElementById('characterDifficulty');
        if (!checkbox.checked || !this.config.characterDifficulty.enabled) {
            return null;
        }

        const charConfig = this.config.characterDifficulty;
        let availableDifficulties = [...charConfig.difficulties];

        const worldResult = this.getWorldResult();
        if (worldResult && worldResult.difficulty === 'Приключение' && charConfig.forceAdventureIfWorldIsAdventure) {
            return { difficulty: 'Приключение' };
        }

        return {
            difficulty: this.getRandomElement(availableDifficulties)
        };
    }

    randomizeClass() {
        const classCheckbox = document.getElementById('characterClass');
        const subclassCheckbox = document.getElementById('characterSubclass');
        
        let result = {};

        if (classCheckbox.checked && this.config.characterClass.enabled) {
            const selectedClass = this.getRandomElement(this.config.characterClass.classes);
            result.class = selectedClass;

            if (subclassCheckbox.checked && this.config.characterSubclass.enabled) {
                const subclasses = this.config.characterSubclass.subclasses[selectedClass];
                if (subclasses && subclasses.length > 0) {
                    result.subclass = this.getRandomElement(subclasses);
                }
            }
        }

        return Object.keys(result).length > 0 ? result : null;
    }

    getWorldResult() {
        return this.lastWorldResult || null;
    }

    displayResults(results) {
        this.lastWorldResult = results.world;
        
        this.displayWorldResult(results.world);
        this.displayCharacterResult(results.character);
        this.displayClassResult(results.class);

        this.animateResults();
    }

    displayWorldResult(worldResult) {
        const container = document.getElementById('worldResult');
        
        if (!worldResult) {
            container.innerHTML = '<p style="color: #666;">Рандомизация настроек мира отключена</p>';
            return;
        }

        container.innerHTML = `
            <div class="result-item">
                <strong>🌍 Размер мира:</strong> ${worldResult.size}
            </div>
            <div class="result-item">
                <strong>⚡ Сложность:</strong> ${worldResult.difficulty}
            </div>
            <div class="result-item">
                <strong>🦠 Заражение:</strong> ${worldResult.corruption}
            </div>
        `;
    }

    displayCharacterResult(characterResult) {
        const container = document.getElementById('characterResult');
        
        if (!characterResult) {
            container.innerHTML = '<p style="color: #666;">Рандомизация сложности персонажа отключена</p>';
            return;
        }

        container.innerHTML = `
            <div class="result-item">
                <strong>💪 Сложность персонажа:</strong> ${characterResult.difficulty}
            </div>
        `;
    }

    displayClassResult(classResult) {
        const container = document.getElementById('classResult');
        
        if (!classResult) {
            container.innerHTML = '<p style="color: #666;">Рандомизация класса персонажа отключена</p>';
            return;
        }

        let html = `
            <div class="result-item">
                <strong>⚔️ Класс:</strong> ${classResult.class}
            </div>
        `;

        if (classResult.subclass) {
            html += `
                <div class="result-item">
                    <strong>🎯 Подкласс:</strong> ${classResult.subclass}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    animateResults() {
        const cards = document.querySelectorAll('.result-card');
        cards.forEach((card, index) => {
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = `fadeInUp 0.5s ease forwards`;
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
            z-index: 1000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TerrariaRandomizer();
});