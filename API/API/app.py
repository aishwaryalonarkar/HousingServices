import re
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import smtplib
import random
import uuid
import time
from tabulate import tabulate
from prettytable import PrettyTable
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'dbproj'

mysql = MySQL(app)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/newdata", methods=['GET', 'POST'])
def user_data():
    if request.method == "POST":
            user_data = request.json
            sql_id = uuid.uuid1()
            form_name = user_data['name']
            form_phone = user_data['phone']
            form_apartment = user_data['apartment']
            form_email = user_data['email']
            conn = mysql.connection
            cursor = conn.cursor()
            query = "INSERT INTO Users values(%s,%s,%s,%s,%s,%s,%s,%s)"
            cursor.execute(query, [sql_id, form_name, form_phone, form_apartment, form_email,'0','0', '0'])
            cursor.execute("SELECT * from Users")
            mysql.connection.commit()
            return {"status":"success"}

@app.route("/newservice", methods=['GET','POST'])
def new_service():
    if request.method == 'POST':
        service_data = request.json
        service_id = uuid.uuid1()
        service_name = service_data['name']
        service_cost = service_data['cost']
        
        conn = mysql.connection
        cursor = conn.cursor()
        query = "INSERT INTO Service values(%s,%s,%s)"
        cursor.execute(query, [service_id, service_name, service_cost])
        # cursor.execute("SELECT * from Users")
        mysql.connection.commit()
        return {"status":"success"}

@app.route("/getUsers", methods=['GET','POST'])
def get_user():
    if request.method == 'GET':
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users")
        data = cursor.fetchall()
        mysql.connection.commit()
        return {"status":"success","data":data}

@app.route("/getService", methods=['GET','POST'])
def get_service():
    if request.method == 'GET':
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Service")
        data = cursor.fetchall()
        mysql.connection.commit()
        return {"status":"success","data":data}

@app.route("/createRequest",  methods=['GET','POST'])
def create_request():
    if request.method == 'POST':
        request_data = request.json
        request_id = uuid.uuid1()
        request_apartment_id = request_data['resident_id']
        request_service_id = request_data['service_id']
        conn = mysql.connection
        cursor = conn.cursor()
        query = "INSERT INTO Request values(%s,%s,%s)"
        cursor.execute(query, [request_id, request_apartment_id, request_service_id])
        mysql.connection.commit()
        return {"status":"success"}

@app.route("/requestConsumed",  methods=['GET','POST'])
def request_consumed():
    if request.method == 'POST':
        request_data = request.json
        print(request_data)
        request_id = uuid.uuid1()
        request_consumed_id = request_data['consumed_id']
        request_user_id = request_data['resident_id']
        request_service_id = request_data['service_id']
        request_cost = request_data['cost']
        conn = mysql.connection
        cursor = conn.cursor()
        temp_date = time.strftime("%Y-%m-%d")
        print(temp_date)
        query = "INSERT INTO RequestConsumed values(%s,%s,%s,%s,%s,%s)"
        cursor.execute(query, [request_id, request_user_id, request_service_id, request_consumed_id, temp_date, request_cost])
        mysql.connection.commit()
        return {"status":"success"}

@app.route("/getRequests", methods=['GET','POST'])
def request_join():
    if request.method == 'GET':
        # input_data = request.json
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("SELECT u.Apartment, s.name, s.cost, s.id, u.id, r.id from Users u, Service s , Request r where s.id = r.service_id and u.id = r.resident_id")
        data = cursor.fetchall()
        mysql.connection.commit()
        return {"status":"success","data":data}

@app.route("/getMonthlyCostGroup", methods=['GET','POST'])
def billing_group():
    if request.method == 'POST':
        income_data = request.json
        month = income_data['month']
        conn = mysql.connection
        cursor = conn.cursor()
        query = "select u.id, u.Apartment, u.Name, u.Email, u.dues, u.paid, SUM(c.consumed_cost) as Total, u.Month, s.id from Users u, Service s, RequestConsumed c where s.id = c.service_id and u.id = c.user_id and ( select extract(MONTH from consumed_date) = (%s)) group by u.id;"
        cursor.execute(query, month)
        data = cursor.fetchall()
        mysql.connection.commit()
        return {"status":"success","data":data}

@app.route("/getMonthlyCost", methods=['GET','POST'])
def billing():
    if request.method == 'POST':
        income_data = request.json
        # print(income_data)
        month = income_data['month']
        user_id = income_data['user']
        conn = mysql.connection
        cursor = conn.cursor()
        query = "select u.id, u.Apartment, u.Name, u.Email, u.dues, u.paid, c.consumed_cost, s.id, s.name , c.consumed_date from Users u, Service s, RequestConsumed c where s.id = c.service_id and u.id = c.user_id and u.Apartment = %s and ( select extract(MONTH from consumed_date) = (%s));"
        cursor.execute(query, [user_id, month])
        data = cursor.fetchall()
        mysql.connection.commit()
        total = 0
        for i in data :
            total = total + i[6]

        email = data[0][3]
        name = data[0][2]
        apartment = data[0][1]
        paid = data[0][6]
        dues = data[0][5]

        email_payload = "\n Hello "+ name +", Your monthly statement for the services due on month end is ready. A summary of charges is below."
        email_payload += "\n Current Service Charges : \n\n\n"

        email_payload += "service_date  | \tservice_cost  | \tservice_name \n\n"
        myTable = PrettyTable(["Service Name", "Service Cost", "Service Date"])
        temp_tuple = [['service_name','service_cost','service_date']]
        for j in data :
            service_cost = j[6]
            service_name = j[8]
            service_date = j[9]
            email_payload = email_payload + str(service_date) + "   \t\t  " + str(service_cost) + "   \t\t\t\t  " + str(service_name) +"\n"
   

        email_payload += "\n Total Cost : " + str(total)

        s = smtplib.SMTP("smtp.gmail.com" , 587)  
        s.starttls()
        subject = "Monthly Housing Service Statement "  
        s.login("noreply.multiauth@gmail.com" , "Password@1A")

        tab_data = email_payload

        message = 'Subject: {}\n\n{}'.format(subject, tab_data)
        s.sendmail("noreply.multiauth@gmail.com", email, message)    
        s.quit()

        return {"status":"success","data":data}

@app.route("/updateDues", methods=['GET','POST'])
def update_user():
    if request.method == 'POST':
        received_data = request.json
        month =  received_data['month']
        conn = mysql.connection
        cursor = conn.cursor()
        query = ("Update Users, RequestConsumed set Users.dues = (select SUM(consumed_cost) from RequestConsumed where RequestConsumed.user_id = Users.id and (select extract(MONTH from RequestConsumed.consumed_date)) = %s), Users.month = %s;")
        cursor.execute(query,[month,month])
        mysql.connection.commit()
        return {"status":"success"}
        
@app.route("/updatePayment", methods=['GET','POST'])
def update_payment():
    if request.method == 'POST':
        received_data = request.json
        month =  received_data['month']
        resident_id = received_data['resident_id']
        paid = received_data['amount']
        conn = mysql.connection
        cursor = conn.cursor()
        query = ("Update Users set dues = dues - %s where Apartment = %s and month = %s;")
        cursor.execute(query,[paid,resident_id,month])
        mysql.connection.commit()
        return {"status":"success"}

@app.route("/updateUsers", methods=['GET','POST'])
def update_user_new():
    if request.method == 'POST':
        received_data = request.json
        name = received_data['name']
        phone = received_data['phone']
        apt = received_data['apartment']
        email = received_data['email']
        month = received_data['month']
        dues = received_data['dues']
        paid = received_data['paid']
        id = received_data['resident_id']
        query = ("Update Users set Name = %s, Phone = %s, Apartment = %s, Email = %s, Month = %s, dues = %s, paid = %s where id = %s;")
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute(query,[name, phone, apt, email, month, dues, paid, id])
        mysql.connection.commit()
        return {"status":"success"}

if __name__ == '__main__':
    app.debug = True
    app.run(port=5200)
    # app.run(host='192.168.1.247',port=5200)