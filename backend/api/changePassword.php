<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once "../config/db.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request method"
    ]);
    exit;
}

$user_id = $_POST["user_id"] ?? "";
$current_password = $_POST["current_password"] ?? "";
$new_password = $_POST["new_password"] ?? "";

if (empty($user_id) || empty($current_password) || empty($new_password)) {
    echo json_encode([
        "status" => "error",
        "message" => "All fields are required"
    ]);
    exit;
}

if (strlen($new_password) < 6) {
    echo json_encode([
        "status" => "error",
        "message" => "New password must be at least 6 characters"
    ]);
    exit;
}

$sql = "SELECT password FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($current_password, $user["password"])) {
    echo json_encode([
        "status" => "error",
        "message" => "Current password is incorrect"
    ]);
    exit;
}

$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

$update_sql = "UPDATE users SET password = ? WHERE id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("si", $hashed_password, $user_id);

if ($update_stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Password changed successfully"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to update password"
    ]);
}
?>