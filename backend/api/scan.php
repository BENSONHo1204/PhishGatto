<?php
require_once "../config/cors.php";

header("Content-Type: application/json");

// Allow only POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request method"
    ]);
    exit;
}

if (!isset($_POST["url"])) {
    echo json_encode([
        "status" => "error",
        "message" => "URL is required"
    ]);
    exit;
}

$url = trim($_POST["url"]);

if ($url === "") {
    echo json_encode([
        "status" => "error",
        "message" => "URL cannot be empty"
    ]);
    exit;
}

if (strlen($url) > 2048) {
    echo json_encode([
        "status" => "error",
        "message" => "URL too long"
    ]);
    exit;
}

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid URL format"
    ]);
    exit;
}

$scheme = parse_url($url, PHP_URL_SCHEME);

if (!in_array($scheme, ["http","https"])) {
    echo json_encode([
        "status" => "error",
        "message" => "Only HTTP and HTTPS allowed"
    ]);
    exit;
}

$safeUrl = escapeshellarg($url);

$command = "python ../ml/app.py $safeUrl 2>&1";

$output = shell_exec($command);

if ($output === null) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to analyze URL"
    ]);
    exit;
}

$response = json_decode($output, true);

if ($response === null) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid response from analysis engine"
    ]);
    exit;
}

echo json_encode([
    "status" => "success",
    "data" => $response
]);