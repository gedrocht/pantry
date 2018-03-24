<?php
$db = new mysqli('localhost', 'root', 'CousCous', 'pantry');

if($db->connect_errno > 0){
    echo 'Unable to connect to database [' . $db->connect_error . ']';
}

$post_ID = $_POST['ID'];

$sql = "update products set opened = NOW() where opened is NULL and ID=\"$post_ID\"";

if(!$result = $db->query($sql)){
    echo 'There was an error running the query [' . $db->error . ']';
} else {
    echo $_POST['ID'];
}
?>