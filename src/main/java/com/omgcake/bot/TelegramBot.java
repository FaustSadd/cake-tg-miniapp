package com.omgcake.bot;

import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.webapp.WebAppInfo;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TelegramBot extends TelegramLongPollingBot {
    private final BotConfig botConfig;
    private final Map<Long, Long> userStorage = new ConcurrentHashMap<>(); // Храним userId

    @Autowired
    public TelegramBot(BotConfig botConfig) {
        this.botConfig = botConfig;
    }

    @Override
    public String getBotUsername() {
        return botConfig.getBotName();
    }

    @Override
    public String getBotToken() {
        return botConfig.getToken();
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId(); // chatId - это уникальный идентификатор чата
            long userId = update.getMessage().getFrom().getId(); // Получаем уникальный идентификатор пользователя

            System.out.println("User ID: " + userId); // Выводим userId в консоль для отладки

            // Сохраняем userId в памяти
            userStorage.put(userId, chatId);

            if (messageText.equals("/miniapp")) {
                SendMessage message = new SendMessage();
                message.setChatId(chatId);
                message.setText("Нажмите кнопку ниже, чтобы открыть мини-приложение:");

                // Создаем кнопку для запуска Web App
                InlineKeyboardMarkup markupInline = new InlineKeyboardMarkup();
                InlineKeyboardButton button = new InlineKeyboardButton();
                button.setText("Открыть мини-приложение");

                // Добавляем userId как параметр в URL
                String webAppUrl = "https://cakeminiapp.h1n.ru/?userId=" + userId; // Передаем userId
                button.setWebApp(new WebAppInfo(webAppUrl)); // Замените на URL вашего Web App
                markupInline.setKeyboard(Collections.singletonList(Collections.singletonList(button)));
                message.setReplyMarkup(markupInline);

                try {
                    execute(message);
                } catch (TelegramApiException e) {
                    e.printStackTrace();
                }
            } else {
                // Обычный ответ на текстовое сообщение
                SendMessage message = new SendMessage();
                message.setChatId(chatId);
                message.setText("Вы написали: " + messageText);

                try {
                    execute(message);
                } catch (TelegramApiException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
