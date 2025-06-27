export const ruTranslations = {
  // Common
  back: 'Назад',
  next: 'Далее',
  cancel: 'Отмена',
  save: 'Сохранить',
  edit: 'Изменить',
  loading: 'Загрузка...',
  error: 'Ошибка',
  free: 'Бесплатно',
  tryAgain: 'Попробовать снова',
  quantity: 'Количество',
  total: 'Итого',
  
  // Welcome Screen
  welcome: {
    title: 'Pulse Coffee',
    subtitle: 'Добро пожаловать в нашу систему самообслуживания',
    features: {
      freshCoffee: {
        title: 'Свежий кофе',
        description: 'Готовим на заказ из отборных зерен'
      },
      quickService: {
        title: 'Быстрое обслуживание',
        description: 'Быстрое оформление заказа и приготовление'
      },
      madeWithLove: {
        title: 'С любовью',
        description: 'Готовят наши опытные бариста'
      }
    },
    startOrder: 'Начать заказ',
    instructions: 'Коснитесь экрана, чтобы начать заказ ваших любимых напитков и закусок'
  },

  // Menu Screen
  menu: {
    title: 'Меню',
    cart: 'Корзина',
    backToMenu: 'Назад в меню',
    categories: {
      coffee: 'Кофе',
      tea: 'Чай',
      pastry: 'Выпечка',
      snacks: 'Закуски'
    },
    loadingMenu: 'Загружаем меню...',
    failedToLoadMenu: 'Не удалось загрузить меню',
    customizable: 'Настраиваемый',
    select: 'Выбрать',
    emptyCategory: {
      title: 'Нет товаров в этой категории',
      description: 'Попробуйте выбрать другую категорию'
    }
  },

  // Customize Screen
  customize: {
    title: 'Настройка',
    backToMenu: 'Назад в меню',
    basePrice: 'Базовая цена',
    loadingCustomizations: 'Загружаем варианты настройки...',
    noCustomizations: 'Для этого продукта нет вариантов настройки.',
    addToCart: 'Добавить в корзину'
  },

  // Cart Screen
  cart: {
    title: 'Корзина',
    backToMenu: 'Назад в меню',
    items: 'товара',
    item: 'товар',
    empty: {
      title: 'Ваша корзина пуста',
      description: 'Добавьте вкусные товары из нашего меню, чтобы начать!',
      browseMenu: 'Просмотреть меню'
    },
    customerInfo: {
      title: 'Информация о клиенте',
      name: 'Имя:',
      addName: '+ Добавить ваше имя'
    },
    orderSummary: {
      title: 'Итоги заказа',
      serviceFee: 'Сервисный сбор:',
      base: 'Основа:'
    },
    proceedToPayment: 'Перейти к оплате',
    continueShopping: 'Продолжить покупки',
    namePlaceholder: 'Введите ваше имя'
  },

  // Payment Screen
  payment: {
    title: 'Оплата',
    backToCart: 'Назад в корзину',
    orderSummary: 'Итоги заказа',
    customer: 'Клиент',
    choosePaymentMethod: 'Выберите способ оплаты',
    methods: {
      qr: {
        title: 'Оплата по QR-коду',
        description: 'Kaspi QR, Halyk QR или другие мобильные платежи'
      },
      card: {
        title: 'Оплата картой',
        description: 'Платежная или дебетовая карта'
      }
    },
    qrPayment: {
      title: 'Отсканируйте QR-код для оплаты',
      instructions: 'Откройте банковское приложение и отсканируйте этот QR-код для завершения платежа',
      waiting: 'Ожидаем подтверждения платежа...',
      madePament: 'Я произвел оплату',
      chooseDifferent: 'Выбрать другой способ'
    },
    cardPayment: {
      title: 'Обработка платежа картой',
      processing: 'Пожалуйста, подождите, пока мы обрабатываем ваш платеж картой...',
      cancelPayment: 'Отменить платеж'
    },
    status: {
      successful: 'Оплата прошла успешно!',
      confirmed: 'Ваш заказ подтвержден и готовится.',
      failed: 'Оплата не удалась',
      failedDescription: 'Что-то пошло не так с вашим платежом. Пожалуйста, попробуйте снова.'
    }
  },

  // Thank You Screen
  thankYou: {
    title: 'Спасибо!',
    subtitle: 'Ваш заказ успешно размещен',
    orderNumber: 'Номер заказа',
    orderNumberDescription: 'Сохраните для справки',
    estimatedTime: 'Примерное время',
    preparing: {
      title: 'Ваш заказ готовится ☕',
      instructions: [
        'Наши бариста тщательно готовят ваш заказ',
        'Вы получите уведомление, когда он будет готов к получению',
        'Пожалуйста, подождите в назначенной зоне',
        'Покажите номер заказа при получении'
      ]
    },
    startNewOrder: 'Начать новый заказ',
    autoRedirect: 'Автоматический возврат на главный экран через'
  },

  // Progress Bar
  progress: {
    welcome: 'Добро пожаловать',
    menu: 'Меню',
    customize: 'Настройка',
    cart: 'Корзина',
    payment: 'Оплата',
    complete: 'Готово'
  },

  // Common units
  units: {
    minutes: 'минут',
    seconds: 'секунд',
    tenge: '₸'
  },

  // Errors
  errors: {
    productNotFound: 'Продукт не найден',
    noItems: 'Нет товаров',
    loadingFailed: 'Не удалось загрузить',
    paymentFailed: 'Платеж не удался'
  }
};

export type TranslationKey = keyof typeof ruTranslations;
