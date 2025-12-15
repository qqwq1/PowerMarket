package org.dev.powermarket.service;

import lombok.extern.slf4j.Slf4j;
import org.dev.powermarket.domain.Notification;
import org.dev.powermarket.domain.enums.NotificationType;
import org.dev.powermarket.security.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Сервис для отправки e-mail уведомлений.
 * Логика отправки построена таким образом, чтобы при отсутствии/неправильной
 * настройке SMTP сервера приложение продолжало работать (ошибки логируются,
 * но не пробрасываются дальше).
 */
@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final boolean mailEnabled;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:no-reply@powermarket.local}") String fromEmail,
            @Value("${app.mail.enabled:true}") boolean mailEnabled
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.mailEnabled = mailEnabled;
    }

    /**
     * Приветственное письмо после регистрации пользователя.
     */
    public void sendWelcomeEmail(User user) {
        if (user == null || isBlank(user.getEmail())) {
            return;
        }

        String subject = "Добро пожаловать на PowerMarket";
        StringBuilder body = new StringBuilder();
        body.append("Здравствуйте");

        if (!isBlank(user.getFullName())) {
            body.append(", ").append(user.getFullName());
        }

        body.append("!\n\n")
            .append("Вы успешно зарегистрировались на платформе PowerMarket.\n")
            .append("Теперь вы можете размещать и арендовать мощности, а также управлять своими сделками в личном кабинете.\n\n")
            .append("С уважением, команда PowerMarket.");

        sendEmail(user.getEmail(), subject, body.toString());
    }

    /**
     * Отправка письма по изменению статуса сделки / уведомлению.
     * Используется вместе с сущностью Notification.
     */
    public void sendDealStatusEmail(User user, Notification notification) {
        if (user == null || notification == null || isBlank(user.getEmail())) {
            return;
        }

        String subject = buildSubjectFromNotification(notification.getType(), notification.getTitle());
        StringBuilder body = new StringBuilder();

        body.append(notification.getMessage() != null ? notification.getMessage() : "")
            .append("\n\n")
            .append("Подробнее о сделке вы можете посмотреть в личном кабинете PowerMarket.");

        sendEmail(user.getEmail(), subject, body.toString());
    }

    private String buildSubjectFromNotification(NotificationType type, String fallbackTitle) {
        if (type == null) {
            return fallbackTitle != null ? fallbackTitle : "Изменение статуса сделки";
        }

        return switch (type) {
            case NEW_RENTAL_REQUEST -> "Новый запрос на аренду";
            case REQUEST_APPROVED -> "Запрос на аренду одобрен";
            case REQUEST_REJECTED -> "Запрос на аренду отклонен";
            case NEW_CHAT_MESSAGE -> "Новое сообщение в чате по сделке";
            case RENTAL_REMINDER -> "Напоминание об аренде";
        };
    }

    /**
     * Базовый метод отправки письма. Ничего не бросает наружу.
     */
    private void sendEmail(String to, String subject, String text) {
        if (!mailEnabled) {
            log.debug("Отправка писем отключена (app.mail.enabled=false). Письмо для {} с темой '{}' не было отправлено.", to, subject);
            return;
        }

        if (isBlank(to)) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Отправлено письмо на адрес {} с темой '{}'", to, subject);
        } catch (Exception ex) {
            // Логируем, но не ломаем основной бизнес-процесс
            log.warn("Не удалось отправить письмо на адрес {}: {}", to, ex.getMessage());
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
