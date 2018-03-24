DATABASE_BACKUP_LOG_ENABLED = false;

function log( str ){
    if( !DATABASE_BACKUP_LOG_ENABLED ){
        console.warn( "Database backup logging has been disabled {" + str + "}" );
        return;
    }
    
    $('.center').append($("<br>")).append($("<br>")).append( str );
}

function do_backup(callback){
    $.ajax({ //try to get product name from the database
        type: "GET",
        url: "db_backup.php",
        dataType: "html",
        success: function(data) {
            log(data)
            
            log("Copying Files...");
            $.ajax({ //let's look up the product name using the python crawler
                type: 'GET',
                url: "/cgi-bin/db_backup.cgi",
                success: function(data){
                    log(data);
                    callback();
                }
            });
        }
    });
}

$(document).ready(function() {
    if( DATABASE_BACKUP_LOG_ENABLED ){
        $('.center').css("text-align","left")
    }
    
    do_backup(function(){});
});