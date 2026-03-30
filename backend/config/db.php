<?php
$host = "127.0.0.1";
$user = "root";
$password = "";
$database = "phishgatto_db";
$port = 3306; // change to 3307 if needed

$conn = new mysqli($host, $user, $password, $database, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>