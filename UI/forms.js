SERVER_URL = "http://172.20.199.153:5200/"

function addService() {
    name = document.getElementById("serviceName").value
    cost = document.getElementById("serviceCost").value
    service_data = {
        "name" : name,
        "cost" : cost
    }

    console.log(service_data)
    $.ajax({
        url: SERVER_URL + "newservice",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( service_data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            alert("Saved");
            location.reload();
        }
    });
}

function register() {
    email = document.getElementById("registerEmail").value
    phone = document.getElementById("registerPhone").value
    apartment = document.getElementById("registerApartment").value
    name = document.getElementById("registerName").value
    user_data = {
        "email" : email,
        "phone" : phone,
        "apartment" : apartment,
        "name" : name
    }
    console.log(user_data);
    $.ajax({
        url: SERVER_URL + "newdata",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( user_data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            alert("Saved")
            location.reload();
        }
    });
}


function createRequest() {
    let e = document.getElementById("apartment");
    let resident_id = e.value;

    e = document.getElementById("services");
    let service_id = e.value;

    user_data = {
        "resident_id" : resident_id,
        "service_id" : service_id
    }

    $.ajax({
        url: SERVER_URL + "createRequest",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( user_data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            alert("Request Sent");
            location.reload();
        }
    });
}


function consumeRequest(request_id) {
    console.log(request_id)
    let resident_id = document.getElementById("requestUserId"+request_id).innerHTML;
    let consumed_id = document.getElementById("requestRequestId"+request_id).innerHTML;
    let service_id = document.getElementById("requestServiceId"+request_id).innerHTML;
    let cost = document.getElementById("requestCost"+request_id).innerHTML;
    user_data = {
        "resident_id" : resident_id,
        "service_id" : service_id,
        "consumed_id" : consumed_id,
        "cost" : cost
    }
    console.log(user_data)
    $.ajax({
        url: SERVER_URL + "requestConsumed",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( user_data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            alert("Request Updated")
            location.reload();
        }
    });
}

function getMonthlyCost() {
    let e = document.getElementById("recon_months");
    let month = e.value;
    data = {"month" : month}
    $.ajax({
        url: SERVER_URL + "getMonthlyCostGroup",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            for (let i=0;i<res.data.length;i++) {
                let dues = res.data[i][4]
                let total = res.data[i][6]
                let last_paid_month = res.data[i][7]
                let user_id = res.data[i][0]
                let apartment = res.data[i][1]
                if (month > last_paid_month) {
                    dues = dues + total
                }
                $("#monthly_data").append(`<tr id=request`+i+`>
                <td>`+res.data[i][1]+`</td>
                <td>`+res.data[i][2]+`</td>
                <td>`+res.data[i][3]+`</td>
                <td>`+dues+`</td>
                <td>`+res.data[i][5]+`</td>
                <td>`+total+`</td>
                <td>
                <button class="btn btn-primary" onclick="sendEmail(`+apartment+`)">Send Bill</button>
                </td>
                </tr>`)
            }
        }
    });
}

function sendEmail(user_id) {
    // alert(user_id)
    let e = document.getElementById("recon_months");
    let month = e.value;
    user_data = {
        "user" : user_id,
        "month" : month
    }
    $.ajax({
        url: SERVER_URL + "getMonthlyCost",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( user_data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
        }
    });
    
}

function updateDues() {
    // alert("update Dues")
    const d = new Date();
    let month = d.getMonth()+1;
    user_data = {
        "month" : month
    }
    $.ajax({
        url: SERVER_URL + "updateDues",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( user_data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
        }
    });
}

function editUser(apartment_id) {
    // alert(apartment_id)
    $("#editUsers"+apartment_id).show()
}

function editUserCommit(apartment_id) {
    name = document.getElementById("editUderName"+apartment_id).value
    phone = document.getElementById("editUderPhone"+apartment_id).value
    apartment = document.getElementById("editUderApartment"+apartment_id).value
    email = document.getElementById("editUderEmail"+apartment_id).value
    month = document.getElementById("editUderMonth"+apartment_id).value
    dues = document.getElementById("editUderDues"+apartment_id).value
    paid = document.getElementById("editUderPaid"+apartment_id).value
    id = document.getElementById("editUderId"+apartment_id).value
    user_data = {
        "name" : name,
        "phone" : phone,
        "apartment" : apartment,
        "email" : email,
        "month" : month,
        "dues" : dues,
        "paid" : paid,
        "resident_id" : id
    }
    console.log(user_data)
    $.ajax({
        url: SERVER_URL + "updateUsers",
        type: 'POST',
        dataType: 'json', 
        data : JSON.stringify( user_data ),
        contentType: "application/json",
        success: function(res) {
            console.log(res);
            alert("Resident Information Updated");
            location.reload();
        }
    });
}
