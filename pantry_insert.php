<?php
$db = new mysqli('localhost', 'root', 'CousCous', 'pantry');

if($db->connect_errno > 0){
    echo 'Unable to connect to database [' . $db->connect_error . ']';
}

$post_UPC = $_POST['UPC'];
$post_purchased = $_POST['purchased'];

$sql = "insert into products (UPC, purchased) values(\"$post_UPC\", \"$post_purchased\")";

if(!$result = $db->query($sql)){
    echo 'There was an error running the query [' . $db->error . ']';
} else {
    echo $_POST['UPC'];
}
?>