const apiUrls = {
  //http://174.129.83.62  https://www.reformasycotizaciones.com/api
  baseURL: 'https://www.reformasycotizaciones.com/api',
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
    cotizarCielo: '/cotizacion-cielo',
    cotizarTecho: '/cotizacion-techo',
    cotizarCimientos: '/cotizacion-cimientos',
    cotizarVigas: '/cotizacion-vigas',
    cotizarColumnas: '/cotizacion-columnas',
    cotizarHidraulico: '/cotizacion-hidraulico'
  },
  admin: {
    clientes: '/admin/clientes',
    modelosManoObra: '/admin/modelos-mano-obra',
    datosModeloManoObra: '/admin/datos-modelo-mano-obra',
    modificarModeloManoObra: '/admin/modificar-modelo-mano-obra',
    crearModeloManoObra: '/admin/crear-modelo-mano-obra',
    modelosMaterial: '/admin/modelos-material',
    datosModeloMaterial: '/admin/datos-modelo-material',
    modificarModeloMaterial: '/admin/modificar-modelo-material',
    crearModeloMaterial: '/admin/crear-modelo-material',
    incrementarPorcentajeManoObra: '/admin/incrementar-porcentaje-mano-obra',
    decrementarPorcentajeManoObra: '/admin/decrementar-porcentaje-mano-obra'
  }
};

export default apiUrls;