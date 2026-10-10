<?php
$requestPath = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

if ($requestPath === "/db/db.json") {
    http_response_code(404);
    exit;
}

return false;
