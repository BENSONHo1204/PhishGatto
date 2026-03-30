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

$domain = $_POST['domain'];

$sql = "INSERT INTO blacklist (domain) VALUES (?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $domain);

$stmt->execute();

echo json_encode(["status"=>"added"]);
?>