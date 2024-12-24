// Получаем корзину из localStorage или инициализируем пустую
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Обработчик для кнопок выбора веса
document.querySelectorAll('.weight-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const weightButtons = event.target.closest('.weight-buttons').querySelectorAll('.weight-btn');

        // Убираем класс "selected" у всех кнопок
        weightButtons.forEach(btn => btn.classList.remove('selected'));

        // Добавляем класс "selected" на нажатую кнопку
        event.target.classList.add('selected');

        // Сохраняем выбранный вес в data-атрибут товара
        const product = event.target.closest('.product');
        const weight = event.target.getAttribute('data-weight');
        if (product) {
            product.setAttribute('data-weight', weight);
        }
    });
});

// Обработчик для кнопок "Добавить в корзину"
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        const product = event.target.closest('.product');
        if (!product) return; // Если товар не найден, прекращаем выполнение

        const productId = product.getAttribute('data-id');
        const productName = product.getAttribute('data-name');
        const productPrice = product.getAttribute('data-price');
        const weight = parseFloat(product.getAttribute('data-weight')); // Преобразуем вес в число

        if (!weight) {
            showToast('Пожалуйста, выберите вес');
            return; // Если вес не выбран, не добавляем в корзину
        }

        // Расчет общей цены в зависимости от веса
        const pricePerKg = parseFloat(productPrice);  // Цена за 1 кг
        const totalPrice = pricePerKg * weight;  // Общая стоимость с учетом веса

        // Проверка на наличие товара в корзине
        const existingProductIndex = cart.findIndex(item => item.id === productId && item.weight === weight);
        if (existingProductIndex !== -1) {
            // Если товар с таким весом уже есть в корзине, обновляем его количество и цену
            cart[existingProductIndex].price = totalPrice;
        } else {
            // Если товара с таким весом нет, добавляем его в корзину
            cart.push({
                id: productId,
                name: productName,
                price: totalPrice,
                weight: weight
            });
        }

        // Сохраняем корзину в localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        showToast(`${productName} (${weight} кг) добавлен в корзину`);
    });
});

// Обработчик для кнопки перехода в корзину
const goToCartButton = document.getElementById('goToCartButton');
if (goToCartButton) {
    goToCartButton.addEventListener('click', () => {
        window.location.href = "cart.html"; // Переход на страницу корзины
    });
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
