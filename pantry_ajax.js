Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); //month is zero-based
  var dd  = this.getDate().toString();
  return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
};

Date.prototype.daysBetween = function(date1, date2) {
    var oneDay = 1000*60*60*24;
    var ms_1 = date1.getTime();
    var ms_2 = date2.getTime();
    var ms_diff = ms_2 - ms_1;
    return Math.round(ms_diff / oneDay);
}

$.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

function createNewDate( month, day, year ){
    var newDate = new Date();
    
    newDate.setMonth(month-1); //month is zero-based
    newDate.setDate(day);
    newDate.setFullYear(year);
    
    return newDate;
}

function getDaysAgo( date ){
    if( date == null ){
        return date;
    }
    
    var split = date.split("-")
    var year = Number(split[0]);
    var month = Number(split[1]);
    var day = Number(split[2]);
    
    var oldDate = createNewDate( month, day, year );
    var daysAgo = oldDate.daysBetween(oldDate, new Date());
    
    var daysAgoStr = daysAgo + " days ago"
    switch(daysAgo){
        case 0: daysAgoStr = "Today"; break;
        case 1: daysAgoStr = "Yesterday"; break;
    }
    
    var dateStr = month + "/" + day + "/" + year;
    
    return $('<a>')
        .prop('title', dateStr)
        .append(daysAgoStr);
}

function getProductName(UPC, callback){
    crawler_error = "//W3C//DTD XHTML 1.0 Transi";
    
    $.ajax({ //try to get product name from the database
        type: "POST",
        url: "product_name_select.php",
        data: { UPC:UPC },
        dataType: "html",
        success: function(db_data) {
            if( db_data == "UNKNOWN" ){ //we don't know the name of this product
            
                $.ajax({ //let's look up the product name using the python crawler
                    type: 'POST',
                    url: "/cgi-bin/UPC_crawler.cgi?UPC="+UPC,
                    success: function(crawl_data){
                        if( crawl_data.indexOf(crawler_error) != -1 ){ //did the crawler fail?
                            callback({title:UPC, UPC:true}); //return the UPC to indicate this failure
                        } else { //did the crawler succeed?
                        
                            console.log("POSTing to product_name_insert.php: ",{ UPC:UPC, name:crawl_data });
                        
                            $.ajax({ //put the product name into the database
                                type: "POST",
                                url: "product_name_insert.php",
                                data: { UPC:UPC, name:crawl_data },
                                dataType: "html",
                                success: function(response) {
                                }
                            });
                            
                            //return the product name we got from the python crawler
                            callback({title:crawl_data, UPC:false});
                        }
                    }
                });
                
            } else {
                callback({title:db_data, UPC:false})
            }
        }
    });    
}

$(document).ready(function() {
    function removeProduct(ID){
        $.ajax({
           type: "POST",
           url: "pantry_remove.php",
           dataType: "html",
           data: { ID: ID },
           success: function(response) {
               $(".Product"+ID).remove();
           }
        });
    }
    
    function openProduct(ID){
        $.ajax({
           type: "POST",
           url: "pantry_open.php",
           dataType: "html",
           data: { ID: ID },
           success: function(response) {
                $(".Product"+ID + " td").each(function(a,elem){
                    $(elem).removeClass("opening");
                });
                $("td#Product"+ID+"Opened").text("Today")
           }
        });
    }
    
    function getRemoveButton(ID){
        return $("<input>")
            .prop("type","button")
            .prop("value","X")
            .click((function(ID){ return function(){
                $(".Product"+ID + " td").each(function(a,elem){
                    $(elem).addClass("deleting");
                });
                setTimeout((function(ID){ return function(){
                    var choice = window.confirm("Are you sure you want to remove this?")
                    if( choice ){
                        removeProduct(ID);
                    } else {
                        $(".Product"+ID + " td").each(function(a,elem){
                            $(elem).removeClass("deleting");
                        });
                    }
                }})(ID),5);
            }})(ID))
    }
    
    function getOpenButton(ID){
        return $("<input>")
            .prop("type","button")
            .prop("value","Open")
            .click((function(ID){ return function(){
                $(".Product"+ID + " td").each(function(a,elem){
                    $(elem).addClass("opening");
                });
                setTimeout((function(ID){ return function(){
                    var choice = window.confirm("You're opening this product?")
                    if( choice ){
                        openProduct(ID);
                    } else {
                        $(".Product"+ID + " td").each(function(a,elem){
                            $(elem).removeClass("opening");
                        });
                    }
                }})(ID),5);
            }})(ID))
    }
    
    function getEditableProductName(UPC){
        var func = function(){
            var productUPC = $(this).prop("data-upc");
            var productName = $(this).val();
            
            $(this).parent().append(productName);
            $(this).remove();
            
            $.ajax({ //put the product name into the database
                type: "POST",
                url: "product_name_insert.php",
                data: { UPC:productUPC, name:productName },
                dataType: "html",
                success: function(response) {
                }
            });
        }
        
        return $("<input>")
            .prop("data-upc", UPC)
            .prop("type", "textbox")
            .prop("maxlength", 40)
            .css("width","100%")
            .val("Unknown Product Name")
            .enterKey(func)
            .focusout(func)
            .click(function(){
                $(this).select();
            });
    }
    
    function handleSelect(response){
        try{
            eval(response);
        }catch(e){
            console.error("Error parsing: ", response);
            return;
        }
        
        result.forEach(function(row){
            getProductName(row.UPC, (function(row){ return function(data){
                
                var productTitle = data.title;
                if( data.UPC ){ //we were unable to retrieve the product name, so the title is just a UPC
                    productTitle = getEditableProductName(data.title);
                }
                    
                var productRow = $("<tr>")
                        .addClass("Product"+row.ID)
                        .append($("<td>")
                            .append(row.UPC)
                        ).append($("<td>")
                            .append(productTitle)
                        ).append($("<td>")
                            .append(getDaysAgo(row.purchased))
                            .prop("id","Product" + row.ID + "Purchased")
                        ).append($("<td>")
                            .append(getDaysAgo(row.opened))
                            .prop("id","Product" + row.ID + "Opened")
                        ).append($("<td>")
                            .append(getOpenButton(row.ID))
                        ).append($("<td>")
                            .append(getRemoveButton(row.ID))
                        );
                
                if( data.UPC ) { //we were unable to retrieve the product name, so send this row to the top so the user can enter the product name
                    console.log("hewwo");
                    productRow.insertAfter( $('table#results #titleRow') );
                } else {
                    $('#result table#results').append(productRow);
                }
                
            }; //getProductName callback function
          })(row));
        }); //result.forEach
    }
    
    $("#viewButton").click(function() {
        $("#results").show();
        $('div#result table#results tr').each(function(index, row){
            if( index == 0 ){
                return;
            }
            
            $(row).remove();
        });
        
        $.ajax({
           type: "GET",
           url: "pantry_select_first.php",
           dataType: "html",
           success: function(response) {
                handleSelect(response);
                
                $.ajax({
                   type: "GET",
                   url: "pantry_select_second.php",
                   dataType: "html",
                   success: function(response) {
                        handleSelect(response);
                   }
                });
           }
        });
    });
    
    
    
    $("#UPC").enterKey(function() {
        $("#insertButton").click();
    });
    
    $("#insertButton").click(function() {
        var date = new Date();
        now = date.yyyymmdd();
        $.ajax({
            type: "POST",
            url: "pantry_insert.php",
            data: { UPC: $("#UPC").val().trim(), purchased: now  },
            dataType: "html",
            success: function(response) {
                if( response == $("#UPC").val().trim() ){
                    getProductName( $("#UPC").val().trim(),
                    function(data){
                        $("#textResults").text(data.title + " has been added to the pantry");
                    });
                } else {
                    $("#textResults").html(response + " has been added to the pantry");
                }
                $("#UPC").val("");
            }
        });
    });
    $('#UPClookupButton').click(function() {
        console.log($("#UPC").val());
        getProductName( $('#UPC').val(), 
        function(data){
            $('#result').text(data.title);
        });
    });
});