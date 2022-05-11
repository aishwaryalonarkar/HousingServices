SERVER_URL = "http://172.20.199.153:5200/"




$.ajax({
    url: SERVER_URL + "getService",
    type: 'GET',
    dataType: 'json', 
    contentType: "application/json",
    success: function(res) {
        console.log(res.data);
        for (let i=0; i<res.data.length; i++) {
            console.log(res.data[i][1],"op")
            if(res.data[i][1] != null) {
                // $("#services").append("<option name = "+res.data[i][0]+" >"+res.data[i][1]+"<option>")
                $('#services').append(new Option(res.data[i][1], res.data[i][0]))
            }
        }
    }
});

$.ajax({
    url: SERVER_URL + "getUsers",
    type: 'GET',
    dataType: 'json', 
    contentType: "application/json",
    success: function(res) {
        console.log(res.data);
        for (let i=0; i<res.data.length; i++) {
            $('#apartment').append(new Option(res.data[i][3], res.data[i][0]))
        }
        for (let i=0; i<res.data.length; i++) {
            $('#user_data_for_update').append(`<tr>
                <td>`+res.data[i][1]+`</td>
                <td>`+res.data[i][2]+`</td>
                <td>`+res.data[i][3]+`</td>
                <td>`+res.data[i][4]+`</td>
                <td>
                    <button type="button" style = "margin-top: 2%; float: right;" onclick="editUser(`+res.data[i][3]+`)" class="btn btn-primary">Update</button>
                </td>
                </tr>`)
                $('#user_data_for_update').append(`<tr class = "editUsers"  id = "editUsers`+res.data[i][3]+`">
                <td><input type = "text" id = "editUderName`+res.data[i][3]+`" value=`+res.data[i][1]+`></td>
                <td><input type = "text" id = "editUderPhone`+res.data[i][3]+`" value=`+res.data[i][2]+`></td>
                <td><input type = "text" id = "editUderApartment`+res.data[i][3]+`" value=`+res.data[i][3]+`></td>
                <td><input type = "text" id = "editUderEmail`+res.data[i][3]+`" value=`+res.data[i][4]+`></td>
                <td class="abstract"><input type = "text" id = "editUderMonth`+res.data[i][3]+`" value=`+res.data[i][5]+`></td>
                <td class="abstract"><input type = "text" id = "editUderDues`+res.data[i][3]+`" value=`+res.data[i][6]+`></td>
                <td class="abstract"><input type = "text" id = "editUderPaid`+res.data[i][3]+`" value=`+res.data[i][7]+`></td>
                <td class="abstract"><input type = "text" id = "editUderId`+res.data[i][3]+`" value=`+res.data[i][0]+`></td>
                <td>
                    <button type="button" style = "margin-top: 2%; float: right;" onclick="editUserCommit(`+res.data[i][3]+`)" class="btn btn-success">✓</button>
                </td>
                </tr>`)
        }
        $(".editUsers").hide()
        $(".abstract").hide()
    }
});

$.ajax({
    url: SERVER_URL + "getRequests",
    type: 'GET',
    dataType: 'json', 
    contentType: "application/json",
    success: function(res) {
        console.log(res.data);
        for (let i=0;i<res.data.length;i++) {
            $("#to-consume").append(`<tr id=request`+i+`>
            <td id=requestApartment`+i+`>`+res.data[i][0]+`</td>
            <td id=requestService`+i+`>`+res.data[i][1]+`</td>
            <td id=requestCost`+i+`>`+res.data[i][2]+`</td>
            <td class="reqAbstract" id=requestServiceId`+i+`>`+res.data[i][3]+`</td>
            <td class="reqAbstract" id=requestUserId`+i+`>`+res.data[i][4]+`</td>
            <td class="reqAbstract" id=requestRequestId`+i+`>`+res.data[i][5]+`</td>
            <td><button class="btn btn-primary" onclick="consumeRequest(`+i+`)">Consume</button></td>
            </tr>`)
        }
        $(".reqAbstract").hide();
    }
});


