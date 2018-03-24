<?php
$db = new mysqli('localhost', 'root', 'CousCous', 'pantry');

if($db->connect_errno > 0){
    echo 'Unable to connect to database [' . $db->connect_error . ']';
}

$post_UPC = $_POST['UPC'];

$sql = "SELECT * FROM productNames WHERE UPC = \"$post_UPC\"";

if(!$result = $db->query($sql)){
    echo 'There was an error running the query [' . $db->error . ']';
} else {
    $row = $result->fetch_assoc();
    if($row){
        echo $row['name'];
    } else {
        echo "UNKNOWN";
    }
}
?>