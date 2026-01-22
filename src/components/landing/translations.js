// Language translations for SKLAD Landing Page
// Supports: UK (Ukrainian), RU (Russian), EN (English)

export const translations = {
    uk: {
        nav: {
            features: 'Можливості',
            howItWorks: 'Як це працює',
            pricing: 'Ціни',
            login: 'Увійти',
            tryFree: 'Спробувати безкоштовно',
        },
        hero: {
            title: 'Складський облік для малого виробництва',
            subtitle: 'Забудьте про Excel. Контролюйте сировину, створюйте технологічні карти, відслідковуйте виробництво — все в одному місці.',
            cta: 'Почати безкоштовно',
            howItWorks: 'Як це працює',
            fullHistory: 'Повна історія',
            autoDeduction: 'Автосписання',
        },
        problems: {
            title: 'Знайомі проблеми?',
            items: [
                {
                    icon: '📦',
                    title: 'Забуваєте замовляти сировину?',
                    description: 'Матеріали закінчуються в найневідповідніший момент, виробництво зупиняється.',
                },
                {
                    icon: '📊',
                    title: 'Excel — це хаос?',
                    description: 'Таблиці розростаються, формули ламаються, ніхто не розуміє що де.',
                },
                {
                    icon: '❓',
                    title: 'Не знаєте скільки витрачаєте?',
                    description: 'Важко порахувати собівартість, коли облік ведеться "на око".',
                },
            ],
        },
        features: {
            title: 'Все для вашого виробництва',
            items: [
                {
                    icon: '📋',
                    title: 'Облік сировини',
                    description: 'Додавайте матеріали, встановлюйте мінімальні залишки, отримуйте сповіщення.',
                },
                {
                    icon: '🧾',
                    title: 'Склад продукту',
                    description: 'Один раз вкажіть склад — система сама розрахує витрати сировини.',
                },
                {
                    icon: '🏭',
                    title: 'Виробництво',
                    description: 'Фіксуйте випуск продукції, автоматичне списання компонентів.',
                },
                {
                    icon: '📜',
                    title: 'Історія операцій',
                    description: 'Повний контроль: хто, коли і що змінив.',
                },
            ],
        },
        howItWorks: {
            title: 'Як це працює?',
            steps: [
                {
                    number: '1',
                    title: 'Налаштуйте одиниці',
                    description: 'Визначте, як ви вимірюєте матеріали (кг, шт, метри).',
                },
                {
                    number: '2',
                    title: 'Додайте матеріали',
                    description: 'Внесіть сировину та встановіть мінімальні залишки.',
                },
                {
                    number: '3',
                    title: 'Створіть склад',
                    description: 'Вкажіть скільки сировини потрібно на кожен продукт.',
                },
                {
                    number: '4',
                    title: 'Фіксуйте виробництво',
                    description: 'Система автоматично спише потрібні компоненти.',
                },
                {
                    number: '5',
                    title: 'Стежте за історією',
                    description: 'Повний журнал усіх змін та операцій.',
                },
                {
                    number: '6',
                    title: 'Аналізуйте склад',
                    description: 'Зручний дашборд із залишками та попередженнями.',
                },
            ],
        },
        useCases: {
            title: 'Для будь-якого виробництва',
            items: [
                { icon: '🍰', name: 'Пекарні та кондитерські' },
                { icon: '🪑', name: 'Меблеві цехи' },
                { icon: '🧵', name: 'Швейні майстерні' },
                { icon: '🎨', name: 'Крафтові виробництва' },
                { icon: '🔧', name: 'Майстерні та СТО' },
                { icon: '🏭', name: 'Невеликі фабрики' },
            ],
        },
        pricing: {
            title: 'Оберіть свій план',
            badge: '🎁 Безкоштовно для перших користувачів',
            free: {
                name: 'Free',
                price: '0',
                currency: '$',
                period: '/назавжди',
                description: 'Щоб спробувати',
                features: [
                    'До 15 матеріалів',
                    'До 5 продуктів',
                    'Історія 30 днів',
                    'Telegram-підтримка',
                ],
                cta: 'Почати безкоштовно',
            },
            starter: {
                name: 'Starter',
                price: '5',
                currency: '$',
                period: '/міс',
                description: 'Для малого виробництва',
                features: [
                    'До 50 матеріалів',
                    'До 20 продуктів',
                    'Повна історія',
                    'Експорт в Excel',
                    'Експорт для 1С',
                ],
                cta: 'Обрати Starter',
                popular: true,
            },
            pro: {
                name: 'Pro + AI',
                price: 'Скоро',
                currency: '',
                period: '',
                description: 'З штучним інтелектом',
                features: [
                    'Безліміт матеріалів',
                    'Безліміт продуктів',
                    'AI-прогнози витрат',
                    'Розрахунок собівартості',
                    'Пріоритетна підтримка',
                ],
                cta: 'Повідомити мене',
                comingSoon: true,
            },
        },
        finalCta: {
            title: 'Готові навести лад на складі?',
            subtitle: 'Приєднуйтесь до сотень малих виробництв, які вже використовують SKLAD.',
            cta: 'Почати безкоштовно',
        },
        footer: {
            copyright: '© 2026 SKLAD. Всі права захищені.',
            madeWith: 'Зроблено з ❤️ для малого бізнесу',
        },
    },

    ru: {
        nav: {
            features: 'Возможности',
            howItWorks: 'Как это работает',
            pricing: 'Цены',
            login: 'Войти',
            tryFree: 'Попробовать бесплатно',
        },
        hero: {
            title: 'Складской учёт для малого производства',
            subtitle: 'Забудьте про Excel. Контролируйте сырьё, создавайте технологические карты, отслеживайте производство — всё в одном месте.',
            cta: 'Начать бесплатно',
            howItWorks: 'Как это работает',
            fullHistory: 'Полная история',
            autoDeduction: 'Автосписание',
        },
        problems: {
            title: 'Знакомые проблемы?',
            items: [
                {
                    icon: '📦',
                    title: 'Забываете заказывать сырьё?',
                    description: 'Материалы заканчиваются в самый неподходящий момент, производство останавливается.',
                },
                {
                    icon: '📊',
                    title: 'Excel — это хаос?',
                    description: 'Таблицы разрастаются, формулы ломаются, никто не понимает что где.',
                },
                {
                    icon: '❓',
                    title: 'Не знаете сколько тратите?',
                    description: 'Сложно посчитать себестоимость, когда учёт ведётся "на глаз".',
                },
            ],
        },
        features: {
            title: 'Всё для вашего производства',
            items: [
                {
                    icon: '📋',
                    title: 'Учёт сырья',
                    description: 'Добавляйте материалы, устанавливайте минимальные остатки, получайте уведомления.',
                },
                {
                    icon: '🧾',
                    title: 'Состав продукта',
                    description: 'Один раз укажите состав — система сама рассчитает расход сырья.',
                },
                {
                    icon: '🏭',
                    title: 'Производство',
                    description: 'Фиксируйте выпуск продукции, автоматическое списание компонентов.',
                },
                {
                    icon: '📜',
                    title: 'История операций',
                    description: 'Полный контроль: кто, когда и что изменил.',
                },
            ],
        },
        howItWorks: {
            title: 'Как это работает?',
            steps: [
                {
                    number: '1',
                    title: 'Настройте единицы',
                    description: 'Определите, как вы измеряете материалы (кг, шт, метры).',
                },
                {
                    number: '2',
                    title: 'Добавьте материалы',
                    description: 'Внесите сырьё и установите минимальные остатки.',
                },
                {
                    number: '3',
                    title: 'Создайте состав',
                    description: 'Укажите сколько сырья нужно на каждый продукт.',
                },
                {
                    number: '4',
                    title: 'Фиксируйте производство',
                    description: 'Система автоматически спишет нужные компоненты.',
                },
                {
                    number: '5',
                    title: 'Следите за историей',
                    description: 'Полный журнал всех изменений и операций.',
                },
                {
                    number: '6',
                    title: 'Анализируйте склад',
                    description: 'Удобный дашборд с остатками и предупреждениями.',
                },
            ],
        },
        useCases: {
            title: 'Для любого производства',
            items: [
                { icon: '🍰', name: 'Пекарни и кондитерские' },
                { icon: '🪑', name: 'Мебельные цехи' },
                { icon: '🧵', name: 'Швейные мастерские' },
                { icon: '🎨', name: 'Крафтовые производства' },
                { icon: '🔧', name: 'Мастерские и СТО' },
                { icon: '🏭', name: 'Небольшие фабрики' },
            ],
        },
        pricing: {
            title: 'Выберите свой план',
            badge: '🎁 Бесплатно для первых пользователей',
            free: {
                name: 'Free',
                price: '0',
                currency: '$',
                period: '/навсегда',
                description: 'Чтобы попробовать',
                features: [
                    'До 15 материалов',
                    'До 5 продуктов',
                    'История 30 дней',
                    'Telegram-поддержка',
                ],
                cta: 'Начать бесплатно',
            },
            starter: {
                name: 'Starter',
                price: '5',
                currency: '$',
                period: '/мес',
                description: 'Для малого производства',
                features: [
                    'До 50 материалов',
                    'До 20 продуктов',
                    'Полная история',
                    'Экспорт в Excel',
                    'Экспорт для 1С',
                ],
                cta: 'Выбрать Starter',
                popular: true,
            },
            pro: {
                name: 'Pro + AI',
                price: 'Скоро',
                currency: '',
                period: '',
                description: 'С искусственным интеллектом',
                features: [
                    'Безлимит материалов',
                    'Безлимит продуктов',
                    'AI-прогнозы расхода',
                    'Расчёт себестоимости',
                    'Приоритетная поддержка',
                ],
                cta: 'Уведомить меня',
                comingSoon: true,
            },
        },
        finalCta: {
            title: 'Готовы навести порядок на складе?',
            subtitle: 'Присоединяйтесь к сотням малых производств, которые уже используют SKLAD.',
            cta: 'Начать бесплатно',
        },
        footer: {
            copyright: '© 2026 SKLAD. Все права защищены.',
            madeWith: 'Сделано с ❤️ для малого бизнеса',
        },
    },

    en: {
        nav: {
            features: 'Features',
            howItWorks: 'How It Works',
            pricing: 'Pricing',
            login: 'Log In',
            tryFree: 'Try for Free',
        },
        hero: {
            title: 'Inventory Management for Small Manufacturers',
            subtitle: 'Forget Excel. Track raw materials, create recipes, monitor production — all in one place.',
            cta: 'Start for Free',
            howItWorks: 'How it works',
            fullHistory: 'Full History',
            autoDeduction: 'Auto-deduction',
        },
        problems: {
            title: 'Sound familiar?',
            items: [
                {
                    icon: '📦',
                    title: 'Forget to order supplies?',
                    description: 'Materials run out at the worst time, production stops.',
                },
                {
                    icon: '📊',
                    title: 'Excel is chaos?',
                    description: 'Spreadsheets grow, formulas break, nobody knows what\'s where.',
                },
                {
                    icon: '❓',
                    title: 'Don\'t know your costs?',
                    description: 'Hard to calculate cost when tracking is done "by eye".',
                },
            ],
        },
        features: {
            title: 'Everything for Your Production',
            items: [
                {
                    icon: '📋',
                    title: 'Material Tracking',
                    description: 'Add materials, set minimum stock levels, get notifications.',
                },
                {
                    icon: '🧾',
                    title: 'Product Composition',
                    description: 'Define composition once — the system calculates material usage.',
                },
                {
                    icon: '🏭',
                    title: 'Production',
                    description: 'Record output, automatic component deduction.',
                },
                {
                    icon: '📜',
                    title: 'Operation History',
                    description: 'Full control: who changed what and when.',
                },
            ],
        },
        howItWorks: {
            title: 'How does it work?',
            steps: [
                {
                    number: '1',
                    title: 'Setup Units',
                    description: 'Define how you measure things (kg, pcs, meters).',
                },
                {
                    number: '2',
                    title: 'Add Materials',
                    description: 'Enter raw materials and set minimum stock levels.',
                },
                {
                    number: '3',
                    title: 'Define Composition',
                    description: 'Create recipes for your products.',
                },
                {
                    number: '4',
                    title: 'Register Production',
                    description: 'Record manufacturing events with auto-deduction.',
                },
                {
                    number: '5',
                    title: 'Monitor History',
                    description: 'Track every single change and operation.',
                },
                {
                    number: '6',
                    title: 'Analyze Stock',
                    description: 'Get insights on your stock levels and performance.',
                },
            ],
        },
        useCases: {
            title: 'For Any Manufacturing',
            items: [
                { icon: '🍰', name: 'Bakeries & Confectioneries' },
                { icon: '🪑', name: 'Furniture Workshops' },
                { icon: '🧵', name: 'Tailoring Studios' },
                { icon: '🎨', name: 'Craft Productions' },
                { icon: '🔧', name: 'Repair Shops' },
                { icon: '🏭', name: 'Small Factories' },
            ],
        },
        pricing: {
            title: 'Choose Your Plan',
            badge: '🎁 Free for Early Users',
            free: {
                name: 'Free',
                price: '0',
                currency: '$',
                period: '/forever',
                description: 'To try it out',
                features: [
                    'Up to 15 materials',
                    'Up to 5 products',
                    '30-day history',
                    'Telegram support',
                ],
                cta: 'Start Free',
            },
            starter: {
                name: 'Starter',
                price: '5',
                currency: '$',
                period: '/mo',
                description: 'For small production',
                features: [
                    'Up to 50 materials',
                    'Up to 20 products',
                    'Full history',
                    'Excel export',
                    '1C export',
                ],
                cta: 'Choose Starter',
                popular: true,
            },
            pro: {
                name: 'Pro + AI',
                price: 'Soon',
                currency: '',
                period: '',
                description: 'With artificial intelligence',
                features: [
                    'Unlimited materials',
                    'Unlimited products',
                    'AI usage forecasts',
                    'Cost calculation',
                    'Priority support',
                ],
                cta: 'Notify Me',
                comingSoon: true,
            },
        },
        finalCta: {
            title: 'Ready to organize your inventory?',
            subtitle: 'Join hundreds of small manufacturers already using SKLAD.',
            cta: 'Start for Free',
        },
        footer: {
            copyright: '© 2026 SKLAD. All rights reserved.',
            madeWith: 'Made with ❤️ for small business',
        },
    },
};

export const languages = [
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const defaultLanguage = 'ru';
