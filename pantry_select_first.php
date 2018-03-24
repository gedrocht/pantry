<?php
$db = new mysqli('localhost', 'root', 'CousCous', 'pantry');

if($db->connect_errno > 0){
    echo 'Unable to connect to database [' . $db->connect_error . ']';
}

$sql = "SELECT * FROM products WHERE opened IS NOT NULL ORDER BY opened";

if(!$result = $db->query($sql)){
    echo 'There was an error running the query [' . $db->error . ']';
} else {
    echo "var result = [";
    while($row = $result->fetch_assoc()){
        $json = array("UPC" => $row['UPC'], "purchased" => $row['purchased'], "opened" => $row['opened'], "ID" => $row["ID"]);
        echo json_encode($json);
        echo ",";
    }
    echo "]";
}
?>