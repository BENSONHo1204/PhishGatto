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
        "message" => "Invalid request"
    ]);
    exit;
}

if (!isset($_POST["user_id"])) {
    echo json_encode([
        "status" => "error",
        "message" => "User ID required"
    ]);
    exit;
}

$user_id = intval($_POST["user_id"]);

$sql = "DELETE FROM users WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "User removed"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to remove user"
    ]);
}
?>