const apiUrls = {
  baseURL: 'http://174.129.83.62/api',
  auth: {
    register: '/registrar-cliente',
    login: '/login',
    logout: '/logout',
    preguntaSeguridad: '/pregunta-seguridad',
    recuperarPassword: '/recuperar-password'
  },
  cotizacion: {
    cotizarMuro: '/cotizacion-muro',
    cotizarPiso: '/cotizacion-piso',
    cotizarCielo: '/cotizacion-cielo'
  }
};

export default apiUrls;