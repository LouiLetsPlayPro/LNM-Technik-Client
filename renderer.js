const fs = require('fs')
const Websocket = require('ws')

const wssforconect = new Websocket.Server({
    host: "127.0.0.2",
    port: 1
})

wssforconect.on('connection', ws => {

    ws.on('message', message => {
        const returnmessage = JSON.parse(message)
        var localstorage = require('./localstorage.json')
        localstorage.port = returnmessage.use_port
        fs.writeFileSync("./localstorage.json", JSON.stringify(localstorage))
        wssforconect.close()
    })

})

const ws = new Websocket("ws:127.0.0.1:9801")

ws.addEventListener("open", e => {
    ws.send(JSON.stringify({
        "auth": {
            "KEY": "15LVM.ts.0,0,1",
            "NAME": "dLVM-1LS.management=server"
        },
        "newconnection": true
    }))
})

class User {
    constructor(profilePicture, name, id,) {
        this.profilePicture = profilePicture;
        this.name = name;
        this.id = id;
    }
}

var thisuser = new User()

setTimeout(() => {

    console.log(require('./localstorage.json').port)

    const wss = new Websocket.Server({
        host: "127.0.0.2",
        port: require('./localstorage.json').port
    })

    wss.on('connection', wsm => {
        wsm.on('message', message => {
            const messagedata = JSON.parse(message)
            console.log(messagedata)
            if (messagedata.question == "getserver") {
                addserver(messagedata.serverdata.server[0].logo)
                for (let i = 0; i < messagedata.serverdata.server[0].user.length; i++) {
                    console.log(messagedata.serverdata.server[0].user[i].name)
                    AddUser(messagedata.serverdata.server[0].user[i].username, messagedata.serverdata.server[0].user[i].id)
                    new User("./profile.JPG", messagedata.serverdata.server[0].user[i].username, messagedata.serverdata.server[0].user[i].id)
                }

                thisuser.name = "Clientuser"

                ws.send(JSON.stringify({
                    "auth": {
                        "KEY": "15LVM.ts.0,0,1",
                        "NAME": "dLVM-1LS.management=server",
                        "ip": "127.0.0.2",
                        "port": require('./localstorage.json').port
                    },
                    "newuser": true,
                    "userdata": "Clientuser"
                }))
                return;

            }

            if (messagedata.question == "newuser") {
                AddUser(messagedata.userdata.username, messagedata.userdata.id)

                if (messagedata.port == require('./localstorage.json').port) {
                    thisuser.name = messagedata.userdata.username
                    thisuser.id = messagedata.userdata.id
                    thisuser.profilePicture = messagedata.userdata.profilePicture
    
                    var data = require('./localstorage.json')
                    data.id = thisuser.id
    
                    const username = document.getElementById("acc_name")
                    username.textContent = thisuser.name
    
                    fs.writeFileSync("./localstorage.json", JSON.stringify(data))
                    console.log("!2")
                    return;
                } else {
                    new User(messagedata.userdata.profilePicture, messagedata.userdata.username, messagedata.userdata.id)
                    console.log("!1")
                    return;
                }
            }

            if (messagedata.question == "mynewuser") {
                AddUser(messagedata.userdata.username, messagedata.userdata.id)
                thisuser.name = messagedata.userdata.username
                thisuser.id = messagedata.userdata.id
                thisuser.profilePicture = messagedata.userdata.profilePicture

                var data = require('./localstorage.json')
                data.id = thisuser.id

                const username = document.getElementById("acc_name")
                username.textContent = thisuser.name

                fs.writeFileSync("./localstorage.json", JSON.stringify(data))
                console.log("!2")
                return;
            }

            if (messagedata.question == "newmessage") {
                SendMessage(messagedata.messagedata.user, messagedata.messagedata.time, messagedata.messagedata.input)
                return;
            }

            if (messagedata.question == "renamuser") {
                if (thisuser.id == messagedata.user.userid) {
                    thisuser.name = messagedata.user.newusername
                    document.getElementById(messagedata.user.userid).textContent = messagedata.user.newusername
                    const username = document.getElementById("acc_name")
                    username.textContent = thisuser.name
                } else {
                    document.getElementById(messagedata.user.userid).textContent = messagedata.user.newusername
                }
                return;
            }

            if (messagedata.question == "removeuser") {
                console.log("REMOVEUSER", messagedata)
                document.getElementById(messagedata.userid.id).remove()
                document.getElementById(messagedata.userid.id + "_div").remove()
                return;
            }
        })
    })

    ws.send(JSON.stringify({
        "auth": {
            "KEY": "15LVM.ts.0,0,1",
            "NAME": "dLVM-1LS.management=server",
            "ip": "127.0.0.2",
            "port": require('./localstorage.json').port
        },
        "getserver": true
    }))
}, 5000)

function addserver(imagename) {
    var serverlist = document.getElementById("server-list")
    var Server_Icon = document.createElement('a');
    var Icon_File = document.createElement('img');
    Icon_File.src = "./icon.jpeg";
    Icon_File.classList.add('server');
    Server_Icon.appendChild(Icon_File)
    serverlist.appendChild(Server_Icon)
}

const user_list = document.getElementById('user-list');
function AddUser(name, id) {
    var user = document.createElement("div");
    user.id = id + "_div"
    user.classList.add("user");
    ProfilePicture = document.createElement("img");
    ProfilePicture.src = "./profile.JPG";
    var Name = document.createElement("span");
    Name.textContent = name;
    Name.id = id
    user.appendChild(ProfilePicture);
    user.appendChild(Name);
    /*user.onclick = function(event){
        ShowUserDropdown(event, User);
    }*/
    user_list.appendChild(user);
}

function currentTime() {
    var time = new Date();
    return "   " + time.getHours() + ":" + time.getMinutes();
}

var input = document.getElementById("chat-input-2");
input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        SendMessageToServer(thisuser, currentTime(), input.value);
        input.value = "";
    }
})

const chatDiv = document.getElementById("chat")
function SendMessage(User, Time, Message) {
    var message = document.createElement("div");
    message.classList.add("message-container");
    var text_wrapper = document.createElement("div");
    var name_span = document.createElement("span");
    name_span.classList.add("name");
    name_span.textContent = User.name;
    var message_span = document.createElement("span");
    message_span.classList.add("message");
    message_span.textContent = Message;
    var time_span = document.createElement("span");
    time_span.classList.add("time");
    time_span.textContent = Time;
    text_wrapper.appendChild(name_span);
    text_wrapper.appendChild(time_span);
    text_wrapper.appendChild(document.createElement("br"));
    text_wrapper.appendChild(message_span);
    message.appendChild(text_wrapper);
    chatDiv.appendChild(message);
}

function SendMessageToServer(user, time, input) {
    ws.send(JSON.stringify({
        "auth": {
            "KEY": "15LVM.ts.0,0,1",
            "NAME": "dLVM-1LS.management=server",
            "ip": "127.0.0.2",
            "port": require('./localstorage.json').port
        },
        "newmessage": true,
        "messagedata": { user: user, time: time, input: input }
    }))
}
