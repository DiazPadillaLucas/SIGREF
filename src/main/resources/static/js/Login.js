document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Aqui validamos que los campos no sean vacios
        if (!username || !password) {
            const errorMsg = document.createElement('div');
            errorMsg.id = 'loginError';
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '10px';
            errorMsg.textContent = 'Por favor, complete todos los campos.';
            document.getElementById('loginForm').appendChild(errorMsg);
            return;
        }
        
        // Se limpian los mensajes de error que habian
        let errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.remove();
        }

        // Se hace la solicitud del logun al server
        console.log('Enviando solicitud de login para:', username);
        fetch('http://localhost:8080/api/usuarios/login?nombreUsuario=' + encodeURIComponent(username) + '&contrasenia=' + encodeURIComponent(password), {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                throw new Error('Credenciales inválidas');
            } else {
                throw new Error('Error inesperado en el servidor');
            }
        })
        .then(data => {
            console.log('Login exitoso:', data);

            // Aqui guardamos el usuario en el localStorage para validarlo en cada operacion
            localStorage.setItem('usuarioLogueado', JSON.stringify(data));
       // Redirigir según el rol
           if (data.rol === "ADMINISTRADOR") {
               window.location.href = "/html/Dashboard.html";
           } else if (data.rol === "OPERADOR") {
               window.location.href = "/html/DashboardOperario.html";
           } else {
               // En caso de que venga un rol inesperado
               alert("Rol de usuario no reconocido");
           }
            // Aqui redirigimos al usuario al Dashboard
           // window.location.href = "/html/Dashboard.html";
        })
        .catch(error => {
            console.error('Error:', error);

            // En caso de error, mostramos un mensaje al usuario
            const errorMsg = document.createElement('div');
            errorMsg.id = 'loginError';
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '10px';
            errorMsg.textContent = error.message;

            document.getElementById('loginForm').appendChild(errorMsg);
        });
    });
});
