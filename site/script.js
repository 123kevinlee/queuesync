function addSong(code, songID, title, authors) {
var formData = {
    room_code: code,
    uri: songID,
    title: title,
    authors: authors
}; //Array 
 
$.ajax({
    processData: false,
    contentType: false,
    url : "https://queuesync.tech/add-song",
    type: "POST",
    data : formData,
    success: function(data, textStatus, jqXHR)
    {
        alert("Sent!");
        //data - response from server
    },
    error: function (jqXHR, textStatus, errorThrown)
    {
        console.log("Error!");
    }
});

}

$(document).ready(function () {
    $("#search").click(function (e) {
        var queryString = document.getElementById("songKeywords").value;
        var code = document.getElementById("code").innerText.substring(11);
        //alert("https://queuesync.tech/get-songs?room-code=" + code + "&query=" + queryString);
        e.preventDefault();
        // here
        $.ajax({
            type: "GET",
            url: "https://queuesync.tech/get-songs?room_code=" + code + "&query=" + queryString,
            // url: "https://cors-anywhere.herokuapp.com/https://f9099312.ngrok.io/get-songs?room_code=TeqFDYYd&query=selena",
            json: true,
            success: function (result) {
                //alert("good");
                var tableHtml = "<tr class=\"table-header\"" + "><th></th><th>Track</th><th>Artist</th></tr>";
                for (var i = 0; i < 5; i++) {
                    tableHtml += "<tr class=\"table-header\"><th>" + (i + 1) + "</th><th>" + result[i].name + "</th><th>" + result[i].artists + "</th><th class=\"add-button\" onclick = \"addSong(\'" + code + "\',\'" + result[i].uri + "\','" + result[i].uri + "\',\'" + result[i].uri + "\')\"><a href=\"#\"><span class=\"glyphicon glyphicon-plus\"></span></a></th></tr>";
                }
                document.getElementById('search-list').innerHTML = tableHtml;
            },
            error: function (result) {
                alert('Error');
            }
        });
    });

    $("search-form").click(function (e) {
        e.preventDefault();
    });

    // $('#search-list').on('click', 'a', function () {
    //     var table = $("search-list");
    //     console.log(table);
    //     var data = table.row($(this).parents('tr')).data();
    //     console.log("good");
    //     var code = document.getElementById("code").innerText.substring(10);
    //     $.ajax({
    //         type: "GET",
    //         url: "https://queuesync.tech/get-songs?room_code=" + code + "&query=" + data[1],
    //         json: true,
    //         success: function (result) {
    //             var songID = results[i].uri;
    //         },
    //         error: function (result) {
    //             alert('Error');
    //         }
    //     });
    //     $.post("https://queuesync.tech/", {
    //             room_code: code,
    //             uri: songID
    //         },
    //         function (data, status) {
    //             console.log("Sent!");
    //         });
    // });
    // // $("#add").click(function (e) {
    // //     e.preventDefault();
    // //     $.ajax({
    // //         type: "POST",
    // //         url: "https://queuesync.tech/add-song?room-code=" + code "",
    // //         json: true,
    // //         success: function (result) {
    // //             alert('ok');
    // //         },
    // //         error: function (result) {
    // //             alert('error');
    // //         }
    // //     });
    // });
});