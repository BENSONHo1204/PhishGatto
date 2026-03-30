<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once "../config/db.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error"]);
    exit;
}

if (!isset($_POST["domain"])) {
    echo json_encode(["status" => "error", "message" => "Domain required"]);
    exit;
}

$domain = trim($_POST["domain"]);

$sql = "DELETE FROM blacklist WHERE domain = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $domain);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Domain removed from blacklist"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to remove domain"
    ]);
}
?>