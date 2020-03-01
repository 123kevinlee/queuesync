$(document).ready(function () {
    $("#search").click(function (e) {
        var queryString = document.getElementById("songKeywords").value;
        var code = document.getElementById("code").innerText.substring(10);
        code = "VlXDQKlS";
        alert(queryString);
        alert(code);
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: "https://queuesync.tech/get-songs?room_code=" + code + "$query=" + queryString,
            json: true,
            success: function (result) {
                var tableHtml = "<tr class=\"table-header\"" + "><th></th><th>Track</th><th>Artist</th></tr>";
                for (var i = 0; i < 5; i++) {
                    tableHtml += "<tr><th>" + (i + 1) + "</th><th>" + result.tracks[i].name + "</th><th>" + result.tracks.items.artist + "</th><th class=\"add-button\"<a href=\"#\"><span class=\"glyphicon glyphicon-plus\"></span></a></th></tr>";
                }
            },
            error: function (result) {
                alert('Error');
            }
        });
    });

    $("#add").click(function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "https://queuesync.tech/add-song",
            json: true,
            success: function (result) {
                alert('ok');
            },
            error: function (result) {
                alert('error');
            }
        });
    });
});