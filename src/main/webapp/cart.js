// Получаем корзину из localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функция для обновления отображения корзины
function updateCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('total-price');

    // Очистка контейнера перед обновлением
    cartContainer.innerHTML = '';

    let totalPrice = 0;

    cart.forEach(item => {
        // Создаем HTML элемент для каждого товара в корзине
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');

        cartItemElement.innerHTML = `
            <p><strong>${item.name}</strong></p>
            <p>Вес: ${item.weight} кг</p>
            <p>Цена: ₽ ${item.price}</p>
            <p class="cart-item-remove" data-id="${item.id}">Удалить</p>
        `;

        // Добавляем товар в контейнер
        cartContainer.appendChild(cartItemElement);

        // Добавляем стоимость товара в общую стоимость
        totalPrice += item.price;
    });

    // Обновляем общую цену
    totalPriceElement.innerText = `Итого: ₽ ${totalPrice}`;

    // Если корзина пуста, показываем соответствующее сообщение
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
    }
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Показываем toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Убираем toast через 3 секунды
    setTimeout(() => {
        toast.classList.remove('show');
        // Удаляем элемент из DOM после завершения анимации
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 500);
    }, 3000);
}

// Обработчик для кнопки очистки корзины
document.getElementById('clearCartButton').addEventListener('click', () => {
    // Очищаем массив корзины
    cart = [];

    // Обновляем localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Обновляем отображение корзины
    updateCart();

    // Оповещаем пользователя
    showToast('Корзина очищена.');
});

// Обработчик для кнопки удаления товара из корзины
document.getElementById('cart-items-container').addEventListener('click', (event) => {
    if (event.target.classList.contains('cart-item-remove')) {
        const itemId = event.target.getAttribute('data-id');

        // Удаляем товар с соответствующим ID из корзины
        cart = cart.filter(item => item.id !== itemId);

        // Обновляем localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Обновляем отображение корзины
        updateCart();

        // Оповещаем пользователя
        showToast('Товар удален из корзины.');
    }
});

// Инициализация отображения корзины при загрузке страницы
updateCart();

// Функция для отправки сообщения в Telegram
function sendOrderToTelegram(userId, orderDetails) {
    const token = 'YOUR_BOT_TOKEN'; // Ваш токен бота
    const chatId = userId; // Получаем userId для отправки сообщения в личный чат
    const message = `Пользователь с ID ${userId} оформил заказ:\n${orderDetails}`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
    };

    // Отправка POST-запроса на API Telegram
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            showToast('Сообщение отправлено в Telegram');
            console.log('Success:', data);
        })
        .catch(error => {
            showToast('Ошибка при отправке сообщения в Telegram');
            console.error('Error:', error);
        });
}

// Получаем userId из URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

// Проверка, если userId отсутствует, показываем ошибку
if (!userId) {
    showToast('Ошибка: не передан userId.');
}

// Обработчик для кнопки оформления заказа
document.getElementById('checkout-button').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Ваша корзина пуста.');
        return;
    }

    // Формируем детали заказа
    let orderDetails = '';
    cart.forEach(item => {
        orderDetails += `<strong>${item.name}</strong> - ${item.weight} кг - ₽ ${item.price}\n`;
    });

    // Отправляем заказ в Telegram
    if (userId) {
        sendOrderToTelegram(userId, orderDetails);
        showToast('Заказ отправлен в Telegram.');
    }
});
