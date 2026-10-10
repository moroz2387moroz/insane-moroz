<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['message' => 'Поддерживаются только POST-запросы.']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    respond(415, ['message' => 'Ожидается запрос с данными JSON.']);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 8192) {
    respond(413, ['message' => 'Размер отправляемых данных превышает допустимый.']);
}

$data = json_decode($rawBody, true);
if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
    respond(400, ['message' => 'Не удалось прочитать данные формы.']);
}

$phone = $data['phone'] ?? null;
if (!is_string($phone) || !preg_match('/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/D', $phone)) {
    respond(422, ['message' => 'Введите полный номер телефона в формате +7 (XXX) XXX-XX-XX.']);
}

$consent = $data['consent'] ?? null;
if (!in_array($consent, ['true', true, 'on'], true)) {
    respond(422, ['message' => 'Необходимо согласиться на обработку персональных данных.']);
}

$name = $data['name'] ?? '';
if (!is_string($name)) {
    respond(422, ['message' => 'Проверьте имя и попробуйте отправить форму ещё раз.']);
}
$name = trim($name);
if (strlen($name) > 400 || preg_match('/[\r\n\x00-\x1F\x7F]/', $name)) {
    respond(422, ['message' => 'Проверьте имя и попробуйте отправить форму ещё раз.']);
}

$form = $data['form'] ?? 'website';
if (!is_string($form) || !preg_match('/^[a-zA-Z0-9_-]{1,40}$/D', $form)) {
    $form = 'website';
}

$recipient = getenv('CONTACT_EMAIL') ?: 'moroz2387moroz@yandex.ru';
if (!is_string($recipient) || filter_var($recipient, FILTER_VALIDATE_EMAIL) === false) {
    respond(500, ['message' => 'Отправка заявок временно недоступна. Свяжитесь с нами по телефону.']);
}

$subject = '=?UTF-8?B?' . base64_encode('Новая заявка с сайта') . '?=';
$body = "Новая заявка с сайта\n\n"
    . "Форма: {$form}\n"
    . ($name !== '' ? "Имя: {$name}\n" : '')
    . "Телефон: {$phone}\n"
    . "Согласие на обработку персональных данных: да\n";
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$sender = getenv('MAIL_FROM');
if (is_string($sender) && filter_var($sender, FILTER_VALIDATE_EMAIL) !== false) {
    $headers[] = 'From: ' . $sender;
}

try {
    set_error_handler(static function (int $severity, string $message): void {
        throw new ErrorException($message, 0, $severity);
    });
    $sent = mail($recipient, $subject, $body, implode("\r\n", $headers));
    restore_error_handler();
} catch (Throwable $error) {
    restore_error_handler();
    error_log('Form email delivery failed: ' . $error->getMessage());
    respond(502, ['message' => 'Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону.']);
}

if (!$sent) {
    respond(502, ['message' => 'Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону.']);
}

respond(200, ['message' => 'Заявка успешно отправлена.']);
