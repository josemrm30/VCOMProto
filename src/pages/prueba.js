const Prueba = () => {
    return (
        <>
            <div className="container" id="main-control-users">
                <div className="form-floating">
                    <input type="text" className="form-control" id="user" name="name" placeholder="username" />
                    <label className="form-label" htmlFor="user">Nickname </label>
                </div>

                <div className="form-text">¡Puede ser repetido! pero no en blanco</div>
                <button className="btn btn-primary" id="conectar">Conectar</button>
                <button className="btn btn-outline-primary" id="desconectar" disabled>Desconectar</button>
                <div className="btn-group" role="group" id="estados">
                    <button type="button" className="btn btn-success" disabled>Online</button>
                    <button type="button" className="btn btn-warning" disabled>Idle</button>
                    <button type="button" className="btn btn-danger" disabled>DND</button>
                </div>
            </div>
            <hr></hr>
            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        <p>Usuarios online</p>
                        <ul className="list-group" id="user-list">
                        </ul>
                    </div>
                    <div className="col-md-5">
                        <div className="video-container">
                            <p>Video Local</p>
                            <video className="embed-responsive-item w-75 h-75" id="local" autoPlay muted></video>
                            <p>Tú</p>
                        </div>
                        <div className="video-container">
                            <p>Video Remoto</p>
                            <video className="embed-responsive-item w-75 h-75" id="remoto" autoPlay></video>
                            <p>Otro user</p>
                        </div>
                    </div>
                </div>
            </div> 
            <script src="/client.js"></script>
        </>
    );
};


export default Prueba;