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

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request method"
    ]);
    exit();
}

$user_id = $_POST["user_id"] ?? null;
$url = $_POST["url"] ?? "";
$risk_level = $_POST["risk_level"] ?? "";
$score = $_POST["score"] ?? 0;
$reasons = $_POST["reasons"] ?? "";

$sql = "INSERT INTO scan_results (user_id, url, risk_level, score, reasons)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("issis", $user_id, $url, $risk_level, $score, $reasons);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "saved"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $stmt->error
    ]);
}
?>