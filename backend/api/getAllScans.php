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

$sql = "SELECT 
    scan_results.id,
    scan_results.user_id,
    scan_results.url,
    scan_results.risk_level,
    scan_results.score,
    scan_results.reasons,
    scan_results.scanned_at,
    users.username,
    users.email
FROM scan_results
LEFT JOIN users ON scan_results.user_id = users.id
ORDER BY scan_results.scanned_at DESC";

$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>