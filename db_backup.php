<?php
$db = new mysqli('localhost', 'root', 'CousCous', 'pantry');

if($db->connect_errno > 0){
    echo 'Unable to connect to database [' . $db->connect_error . ']';
}

$sql_tables = array('productnames',
                    'products');
foreach( $sql_tables as $table_name ){
    echo 'Backing up table "' . $table_name . '"<br>';
    
    $sql = array('flush tables with read lock;',
                 'select * into outfile "C:\\\\ProgramData\\\\MySQL\\\\MySQL Server 5.7\\\\Uploads\\\\db_backup_' . $table_name . '.txt" from ' . $table_name . ';',
                 'unlock tables;');

    $success = true;
    foreach( $sql as $query ){
        if(!$result = $db->query($query)){
            echo 'There was an error running the query [' . $db->error . ']';
            $success = false;
            break;
        }
    }
    if( $success ){
        echo 'Success.<br>';
    } else {
        break;
    }
}
if( $success ){
    echo 'Backup completed successfully.<br>';
} else {
    echo 'The operation did not complete successfully.<br>';
}
?>