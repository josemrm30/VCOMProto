//Variables globales
var ws = null //WebSocket
var pc = null //PeerConnection
var stream = null //Local stream
var llamandoA = "" //ID del usuario con el que estoy en llamada

/**
 * PEERCONNECTION CONFIG
 */
const config = {
    'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' },
    { 'url': 'stun:stun4.l.google.com:19302' },
    {
        'url': 'turn:numb.viagenie.ca',
        'credential': 'muazkh',
        'username': 'webrtc@live.com'
    },
    {
        'url': 'turn:192.158.29.39:3478?transport=udp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
    },
    {
        'url': 'turn:192.158.29.39:3478?transport=tcp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
    }]
}

/**
 * STREAM RESTRICTIONS
 */
const rest = {
    audio: true,
    video: true
}

/**
 * SESSION DESCRIPTION PROTOCOL
 * RESTRICTIONS
 */
const sdprest = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
}

/**
 * VARIABLES LOCALES ÚTILES
 */
var onlineUsers = {} //Diccionario [String (id):String (username)] para guardar cada user
//con su uuid
var iceCandidatesPendientes = [] //Vector de candidatos ice pendientes (por si acaso se enviar candidatos)
//Antes de fijar la conexion remota con pc.setRemoteDescription(...)

/**
 * Web elements
 */
var textboxuser = document.getElementById("user")
var btnconectar = document.getElementById("conectar")
var btndesconectar = document.getElementById("desconectar")
var listausers = document.getElementById("user-list")
var btnEstados = document.getElementById("estados")
var localvideo = document.getElementById("local")
var remotevideo = document.getElementById("remoto")


/**
 * @brief Función usada para clasificar los diferentes tipos de
 *        mensajes que se pueden dar entre el cliente y el server.
 * @param e - Evento con el mensaje
 */
async function onmessagelsn(e) {
    var msg = JSON.parse(e.data)
    console.log(msg)
    switch (msg.tipo) {
        case "icecandidate":    //Si recibo un nuevo candidato ice (del otro peer)
            if (!msg.candidato) break //Si es nulo, paso
            console.log(msg.candidato)
            if (!pc) setupPeerCon()  //En el no muy posible caso de que no tenga la conexion creada, la creo
            if (!pc.remoteDescription) {  //Si la conexión no tiene descripción remota, lo guardo para después.
                iceCandidatesPendientes.push(msg.candidato)
            } else {
                await pc.addIceCandidate(msg.candidato) //Si no, añado el nuevo candidato
                if (iceCandidatesPendientes.length > 0) { //Y miro si tengo pendientes. TODO: Mejorar la comprobación.
                    iceCandidatesPendientes.forEach(async (c) => {
                        console.log("Añadiendo ice candidate pendiente: " + JSON.stringify(c))
                        await pc.addIceCandidate(iceCandidatesPendientes.pop())
                    })
                }
            }
            break
        case "offer":   //Si recibo una oferta
            if (!pc) setupPeerCon() //En el caso de que no tenga conexión, la creo.
            llamandoA = msg.origin_uid //Me está llamando un user, por lo que asigno el uuid a la varibale llamandoA
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)) //A partir de la oferta,
            //creo y asigno la descripción remota a la conexion.
            await setupStreams()                                              //Además, añado el stream local de cámara y video a la conexión
            var answer = await pc.createAnswer(sdprest);  //Ahora, respondo al otro peer. Creo la respuesta
            await pc.setLocalDescription(answer)          //La fijo como descripción local.
            ws.send(JSON.stringify({                      //Y la envio al server para que se la de al otro peer
                tipo: "answer",
                origin_uid: msg.origin_uid,
                remote_uid: msg.remote_uid,
                sdp: answer
            }))
            break;
        case "answer":      //Si recibo una respuesta, es porque he mandado antes una oferta
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)) //Solo asigno la descripción remota de la conexión con la respuesta
            break;
        case "useroffline": //Si un usuario se desconecta, actualizo la lista
            onlineUsers[msg.userid].parentNode.removeChild(onlineUsers[msg.userid])
            //listausers.removeChild(onlineUsers[msg.userid])
            delete onlineUsers[msg.userid]
            break;
        case "useronline":  //Si un usuario se conecta, actualizo la lista
            var child = document.createElement("li");
            child.addEventListener("click", generarListenerClickLista(msg.userid))
            child.innerHTML = msg.username
            onlineUsers[msg.userid] = child
            listausers.appendChild(child)
            break;
        case "getID":   //Si me acabo de conectar, habré pedido mi id. La recojo.
            Object.keys(msg.listausers).forEach((id) => { //Además, creo la lista de usuarios conectados.
                var child = document.createElement("li");
                child.addEventListener("click", generarListenerClickLista(msg.userid))
                child.innerHTML = msg.listausers[id]
                listausers.appendChild(child)
                onlineUsers[id] = child
            })

            //Deshabilita el botón para iniciar una nueva conexión, y la textbox para introducir
            //el username. Guardo mi id.
            window.userid = msg.userid
            btnconectar.disabled = true
            btndesconectar.disabled = false
            textboxuser.disabled = true
            console.log("Tengo mi id: " + window.userid)
            break;
    }
}

/**
 * Función para generar otra función que actuará de listener a la hora de
 * pulsar un usuario de la lista, para así llamarlo.
 * @param {String} id 
 * @returns 
 */
function generarListenerClickLista(id) {
    return (async function () {
        if (llamandoA) {
            alert("Ya estas en una llamada.")
            return
        }
        llamandoA = id
        setupPeerCon() //Voy a llamar, creo la conexión y la oferta.
        await setupStreams()
        let offer = await pc.createOffer(sdprest)
        await pc.setLocalDescription(offer) //Asigno la oferta a mi desc. local
        enviarOferta(offer) //La envío al server para que se la de al otro peer.
    })
}

/**
 * Inicialización de la conexión.
 */
function setupPeerCon() {
    pc = new RTCPeerConnection(config)
    pc.onicecandidate = ((ice) => { //Si encuentro un nuevo ice candidate, lo envío al otro peer.
        if (ice.candidate != null) {  //En el caso de que acabemos de obtener ice candidates de los servers, se enviará null. Lo ignoramos.
            console.log("onicecandidate::Nuevo ice candidate: " + JSON.stringify(ice.candidate))
            var msg = {
                tipo: "icecandidate",
                send: llamandoA,
                candidato: ice.candidate
            }
            ws.send(JSON.stringify(msg))
        } else console.log("Ice candidate nulo. Fin")
    })

    //Se ha añadido una nueva pista a la conexión. Es el stream remoto!
    //Modifico el atributo srcObject del video remoto con este stream
    //NOTA: El elemento representado por remotevideo tiene la opción de AUTOPLAY
    //Por lo que en cuanto el video esté disponible, este se reproducirá automáticamente
    //(no hace falta usar play())
    pc.ontrack = ((e) => {
        console.log("ontrack::Nuevo stream: " + e.streams[0])
        remotevideo.srcObject = e.streams[0]
    })

    //Si me cambia la conexión, por ahora, lo notifico
    pc.onconnectionstatechange = (e) => {
        switch (pc.connectionState) {
            case "connected":
                console.log("Conectados!")
                break;
            case "closed":
                console.log("Conexion cerrada")
                llamandoA = ""
                break;
        }
    }
}


/**
 * Enviar una oferta al server ws.
 * @param {JSON} offer 
 */
function enviarOferta(offer) {
    var msg = {
        tipo: "offer",
        origin_uid: window.userid,
        remote_uid: llamandoA,
        sdp: offer
    }
    ws.send(JSON.stringify(msg))
}

/**
 * Asignar a la conexión las pistas necesarias para transmitir
 * video e audio.
 */
async function setupStreams() {
    media.getTracks().forEach(track => {
        pc.addTrack(track, media)
    })
}

/**
 * Limpiar recursos
 * TODO: mejorar jeje (faltan cosillas, la pereza)
 */
function disconnect() {
    if (ws) {
        const msgdc = {
            tipo: "disconnect",
            userid: window.userid
        }
        console.log(JSON.stringify(msgdc))
        ws.send(JSON.stringify(msgdc))
        btnconectar.disabled = false
        btndesconectar.disabled = true
        textboxuser.disabled = false
        window.userid = null
        listausers.innerHTML = ""
        localvideo.srcObject = null
        pc.close()
        pc = null
        llamandoA = ""
        alert("Adios!")
    } else alert("Como puede ser posible esto xd")
}

/**
 * Inicialización de la conexión al server WS.
 */
function setupWS() {
    if (!textboxuser.value) {
        alert("¡¡No has introducido un usuario!!")
        return
    }
    ws = new WebSocket("ws://localhost:8085")
    ws.addEventListener("open", (e) => {
        console.log("Conectado a ws server... ")
        ws.send(JSON.stringify({
            tipo: "username",
            contenido: textboxuser.value
        }))
    })
    ws.addEventListener("message", onmessagelsn) //Asignar como listener de los eventos "message" la función onmessagelsn
    ws.addEventListener("close", () => {
        console.log("Adios")
    })
    navigator.mediaDevices.getUserMedia(rest).then((e) => {
        localvideo.srcObject = e
        media = e
    });

}

/**
 * LISTENERS INICIALES
 */
window.addEventListener("unload", disconnect)
btndesconectar.addEventListener("click", disconnect)
btnconectar.addEventListener("click", setupWS)